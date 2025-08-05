const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');
require('dotenv').config();
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '10mb' })); // Increase limit for large webhook payloads

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
  next();
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ampersand API client
const ampersand = axios.create({
  baseURL: 'https://api.withampersand.com',
  headers: {
    'X-Api-Key': process.env.AMPERSAND_API_KEY,
    'Content-Type': 'application/json',
  },
});

const readAmpersand = axios.create({
  baseURL: 'https://read.withampersand.com/v1',
  headers: {
    'X-Api-Key': process.env.AMPERSAND_API_KEY,
    'Content-Type': 'application/json',
  },
});

// Separate write client for Ampersand writes
const writeAmpersand = axios.create({
  baseURL: 'https://write.withampersand.com/v1',
  headers: {
    'X-Api-Key': process.env.AMPERSAND_API_KEY,
    'Content-Type': 'application/json',
  },
});

// In-memory storage for demo (in production, use a database)
const dataStore = {
  leads: new Map(),
  accounts: new Map(),
  activities: []
};

// Helper to add activity
function addActivity(type, message, leadId = null) {
  const activity = {
    id: `activity-${Date.now()}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    leadId
  };
  dataStore.activities.unshift(activity);
  // Keep only last 50 activities
  if (dataStore.activities.length > 50) {
    dataStore.activities = dataStore.activities.slice(0, 50);
  }
  console.log(`📝 Activity: ${message}`);
  return activity;
}

// Replace the leadWebhook endpoint with this to handle batch
app.post('/webhooks/leadWebhook', async (req, res) => {
  try {
    const payload = req.body;

    // Log to file first
    fs.appendFileSync('./logs/lead_backfill.log', JSON.stringify(payload, null, 2) + '\n\n', 'utf8');

    if (!payload || !payload.result || !Array.isArray(payload.result)) {
      console.error('Invalid backfill payload - missing result array');
      return res.status(400).send('Invalid payload');
    }

    if (payload.objectName !== 'lead') {
      addActivity('webhook', `Received non-lead batch: ${payload.objectName || 'unknown'}`, null);
      return res.status(200).send('Not leads');
    }

    addActivity('webhook', `Received backfill batch of ${payload.result.length} leads`);

    for (const item of payload.result) {
      const data = item.fields; // Main fields
      const mapped = item.mappedFields || {}; // outreach fields

      if (!data || !data.id) {
        console.error(`Skipping invalid lead in batch: missing id`);
        continue;
      }

      console.log(`📥 Processing backfilled lead: ${data.firstname || ''} ${data.lastname || ''} (${data.id})`);

      // Store lead with aiEmail if present
      dataStore.leads.set(data.id, {
        ...data,
        aiEmail: mapped.outreach_subject ? {
          subject: mapped.outreach_subject,
          body: mapped.outreach_body,
          score: mapped.outreach_score,
          personalizations: mapped.outreach_personalization_notes?.split('\n') || []
        } : null
      });

      // If assigned but no email, generate one
      if (data.ownerid && !mapped.outreach_subject) {
        addActivity('webhook', `Processing backfilled lead: ${data.firstname || 'Unknown'} ${data.lastname || ''}`, data.id);

        try {
          const email = await generateEmail(data);
          // Use payload values, fallback to env if missing
          const projectId = payload.projectId || process.env.AMPERSAND_PROJECT;
          const integrationId = process.env.INSTALLATION_ID;
          const groupRef = payload.groupRef || process.env.GROUP_REF || 'acme-corp';

          console.log(`Updating lead ${data.id} via URL: ${writeAmpersand.defaults.baseURL}/projects/${projectId}/integrations/${integrationId}/objects/lead`);

          await updateLeadInSalesforce(projectId, integrationId, groupRef, data.id, email);

          // Update local store
          const lead = dataStore.leads.get(data.id);
          lead.aiEmail = {
            subject: email.subject,
            body: email.body,
            score: email.score,
            personalizations: email.insights
          };

          addActivity('success', `Email generated for ${data.firstname || 'Unknown'} ${data.lastname || ''} (Score: ${email.score}/100)`, data.id);
        } catch (err) {
          console.error(`Failed to process lead ${data.id}:`, err);
          addActivity('error', `Failed to generate email for lead ${data.id}`, data.id);
        }
      }
    }

    res.status(200).json({ success: true, processed: payload.result.length });
  } catch (error) {
    console.error('❌ Lead backfill failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for account backfill
app.post('/webhooks/accountWebhook', async (req, res) => {
  try {
    const payload = req.body;

    // Log to file first
    fs.appendFileSync('./logs/account_backfill.log', JSON.stringify(payload, null, 2) + '\n\n', 'utf8');

    if (!payload || !payload.result || !Array.isArray(payload.result)) {
      console.error('Invalid backfill payload - missing result array');
      return res.status(400).send('Invalid payload');
    }

    if (payload.objectName !== 'account') {
      addActivity('webhook', `Received non-account batch: ${payload.objectName || 'unknown'}`, null);
      return res.status(200).send('Not accounts');
    }

    addActivity('webhook', `Received backfill batch of ${payload.result.length} accounts`);

    for (const item of payload.result) {
      const data = item.fields;

      if (!data || !data.id) {
        console.error(`Skipping invalid account in batch: missing id`);
        continue;
      }

      console.log(`📥 Processing backfilled account: ${data.name || 'Unknown'} (${data.id})`);

      // Store account
      dataStore.accounts.set(data.id, data);
    }

    res.status(200).json({ success: true, processed: payload.result.length });
  } catch (error) {
    console.error('❌ Account backfill failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for real-time lead updates (assignments)
app.post('/webhooks/leadRealtimeWebhook', async (req, res) => {
  const startTime = Date.now();
  const requestId = `realtime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    console.log(`\n🚀 [${requestId}] Real-time webhook received`);
    console.log(`📊 [${requestId}] Request details:`, {
      method: req.method,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      timestamp: new Date().toISOString()
    });

    // Log to file first
    const logEntry = {
      requestId,
      timestamp: new Date().toISOString(),
      headers: req.headers,
      body: req.body
    };
    fs.appendFileSync('./logs/lead_realtime.log', JSON.stringify(logEntry, null, 2) + '\n\n', 'utf8');
    console.log(`📝 [${requestId}] Payload logged to file`);

    const payload = req.body;

    // Validate payload structure (same as batch webhook)
    if (!payload || !payload.result || !Array.isArray(payload.result)) {
      console.error(`❌ [${requestId}] Invalid real-time payload - missing result array. Available fields:`, Object.keys(payload || {}));
      return res.status(400).send('Invalid payload structure');
    }

    if (payload.objectName !== 'lead') {
      console.log(`⚠️ [${requestId}] Skipping non-lead object: ${payload.objectName}`);
      addActivity('webhook', `Received non-lead real-time update: ${payload.objectName || 'unknown'}`, null);
      return res.status(200).send('Not leads');
    }

    console.log(`🔍 [${requestId}] Real-time webhook details:`, {
      action: payload.action,
      objectName: payload.objectName,
      provider: payload.provider,
      groupRef: payload.groupRef,
      numRecords: payload.result.length,
      projectId: payload.projectId,
      installationId: payload.installationId
    });

    addActivity('webhook', `Received real-time batch of ${payload.result.length} lead updates`);

    let processedCount = 0;
    let emailsGenerated = 0;

    for (const item of payload.result) {
      const data = item.fields; // Main lead fields
      const mapped = item.mappedFields || {}; // Custom outreach fields
      const eventType = item.subscribeEventType; // 'create', 'update', etc.

      if (!data || !data.id) {
        console.error(`❌ [${requestId}] Skipping invalid lead: missing id`);
        continue;
      }

      console.log(`📥 [${requestId}] Processing real-time lead:`, {
        leadId: data.id,
        name: `${data.firstname || 'Unknown'} ${data.lastname || 'Unknown'}`,
        company: data.company || 'Unknown',
        eventType: eventType,
        ownerid: data.ownerid || 'Unassigned',
        hasExistingEmail: !!mapped.outreach_subject
      });

      // Store lead with aiEmail if present
      dataStore.leads.set(data.id, {
        ...data,
        aiEmail: mapped.outreach_subject ? {
          subject: mapped.outreach_subject,
          body: mapped.outreach_body,
          score: mapped.outreach_score,
          personalizations: mapped.outreach_personalization_notes?.split('\n') || []
        } : null
      });

      processedCount++;

      // Check if we should generate an email:
      // 1. Lead is assigned to an owner (has ownerid)
      // 2. No existing AI-generated email (no outreach_subject)
      if (data.ownerid && !mapped.outreach_subject) {
        console.log(`🤖 [${requestId}] Generating email for newly assigned lead: ${data.firstname} ${data.lastname}`);
        addActivity('ai', `Generating real-time email for ${data.firstname || 'Unknown'} ${data.lastname || ''}`, data.id);

        try {
          const emailStartTime = Date.now();
          const email = await generateEmail(data);
          const emailDuration = Date.now() - emailStartTime;

          console.log(`🤖 [${requestId}] Email generated in ${emailDuration}ms:`, {
            leadId: data.id,
            subject: email.subject?.substring(0, 50) + '...',
            bodyLength: email.body?.length,
            score: email.score,
            insightsCount: email.insights?.length
          });

          // Use payload values for Salesforce update (match batch webhook pattern)
          const projectId = payload.projectId || process.env.AMPERSAND_PROJECT;
          const integrationId = process.env.INSTALLATION_ID; // Only use env var like batch webhook
          const groupRef = payload.groupRef || process.env.GROUP_REF || 'acme-corp';

          console.log(`📡 [${requestId}] Updating Salesforce for lead ${data.id}`);
          const updateStartTime = Date.now();
          await updateLeadInSalesforce(projectId, integrationId, groupRef, data.id, email);
          const updateDuration = Date.now() - updateStartTime;

          console.log(`📡 [${requestId}] Salesforce update completed in ${updateDuration}ms`);

          // Update local store with email
          const lead = dataStore.leads.get(data.id);
          lead.aiEmail = {
            subject: email.subject,
            body: email.body,
            score: email.score,
            personalizations: email.insights
          };

          emailsGenerated++;
          addActivity('success', `Real-time email generated for ${data.firstname || 'Unknown'} ${data.lastname || ''} (Score: ${email.score}/100)`, data.id);
        } catch (err) {
          console.error(`❌ [${requestId}] Failed to process lead ${data.id}:`, err);
          addActivity('error', `Failed to generate real-time email for lead ${data.id}: ${err.message}`, data.id);
        }
      } else if (!data.ownerid) {
        console.log(`⚠️ [${requestId}] Lead ${data.id} not assigned to owner, skipping email generation`);
      } else if (mapped.outreach_subject) {
        console.log(`ℹ️ [${requestId}] Lead ${data.id} already has email, skipping generation`);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Real-time webhook processing completed:`, {
      totalDuration: `${totalDuration}ms`,
      recordsProcessed: processedCount,
      emailsGenerated: emailsGenerated,
      totalRecords: payload.result.length
    });

    res.status(200).json({
      success: true,
      requestId,
      processed: processedCount,
      emailsGenerated: emailsGenerated,
      duration: totalDuration
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Real-time webhook failed after ${totalDuration}ms:`, {
      error: error.message,
      stack: error.stack,
      payloadKeys: Object.keys(req.body || {})
    });

    addActivity('error', `Real-time webhook processing failed: ${error.message}`, null);
    res.status(500).json({
      error: error.message,
      requestId,
      duration: totalDuration
    });
  }
});

// API endpoint to get current state (for frontend)
app.get('/api/state', (req, res) => {
  const leads = Array.from(dataStore.leads.values()).map(lead => ({
    id: lead.id,
    firstName: lead.firstname,
    lastName: lead.lastname,
    email: lead.email,
    title: lead.title,
    company: lead.company,
    industry: lead.industry || 'Technology',
    leadSource: lead.leadsource || 'Website',
    assignedTo: lead.ownerid || 'Unassigned',
    status: lead.status || 'New',
    createdAt: lead.createddate,
    updatedAt: lead.lastmodifieddate,
    aiEmail: lead.aiEmail,
    responseStatus: null,
    responseRate: null
  }));

  res.json({
    leads: leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    activities: dataStore.activities.slice(0, 20) // Last 20 activities
  });
});

// API endpoint to trigger read
app.post('/api/trigger-read', async (req, res) => {
  try {
    const projectId = process.env.AMPERSAND_PROJECT;
    const integrationId = process.env.INSTALLATION_ID;
    const groupRef = 'acme-corp'; // Add to .env as GROUP_REF if needed
    const objectName = 'lead';

    if (!projectId || !integrationId) {
      throw new Error('Missing required env vars: AMPERSAND_PROJECT or INSTALLATION_ID');
    }

    const readUrl = `/projects/${projectId}/integrations/${integrationId}/objects/${objectName}`;
    console.log(`Triggering read to URL: ${readAmpersand.defaults.baseURL}${readUrl}`);
    console.log(`With payload: ${JSON.stringify({ groupRef, mode: 'async', sinceTimestamp: '2025-07-10T00:00:00.000Z' })}`);

    const response = await readAmpersand.post(readUrl, {
      groupRef,
      mode: 'async',
      sinceTimestamp: '2025-07-10T00:00:00.000Z'
    });

    console.log(`Read trigger response: ${response.status} - ${JSON.stringify(response.data)}`);

    addActivity('success', 'Manual sync triggered successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Trigger read failed:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to trigger read' });
  }
});

// Generate personalized email using AI
async function generateEmail(lead) {
  const prompt = `You are AmperReach, an AI that writes highly personalized B2B sales emails.

Lead Information:
- Name: ${lead.firstname} ${lead.lastname}
- Title: ${lead.title || 'Unknown'}
- Company: ${lead.company}
- Email: ${lead.email}

Write a personalized outreach email that:
1. References something specific about their company (you can make reasonable inferences)
2. Connects their likely challenges to our solution
3. Includes a clear but soft call-to-action
4. Sounds human and conversational, not salesy

Format your response as JSON:
{
  "subject": "compelling subject line",
  "body": "full email text with proper formatting",
  "score": 85,
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('AI generation failed:', error);
    // Fallback for demo
    return {
      subject: `${lead.firstname}, quick question about ${lead.company}'s growth`,
      body: `Hi ${lead.firstname},\n\nI noticed ${lead.company} is in the technology space. Many companies like yours are looking to accelerate their sales outreach...\n\nWould you be open to a brief call next week?\n\nBest,\nYour Sales Team`,
      score: 75,
      insights: ["Company name referenced", "Industry mentioned", "Clear CTA"]
    };
  }
}

// Update lead in Salesforce with generated email
async function updateLeadInSalesforce(projectId, integrationId, groupRef, leadId, email) {
  console.log(`🔧 updateLeadInSalesforce called with:`, {
    projectId: projectId ? 'SET' : 'MISSING',
    integrationId: integrationId ? 'SET' : 'MISSING',
    groupRef: groupRef || 'MISSING',
    leadId: leadId || 'MISSING',
    emailSubject: email?.subject?.substring(0, 30) + '...' || 'MISSING'
  });

  if (!projectId || !integrationId || !groupRef || !leadId || !email) {
    const missingParams = [];
    if (!projectId) missingParams.push('projectId');
    if (!integrationId) missingParams.push('integrationId');
    if (!groupRef) missingParams.push('groupRef');
    if (!leadId) missingParams.push('leadId');
    if (!email) missingParams.push('email');

    console.error(`❌ Missing required parameters: ${missingParams.join(', ')}`);
    throw new Error(`Missing required parameters for Salesforce update: ${missingParams.join(', ')}`);
  }

  const writePayload = {
    groupRef,
    type: 'update',
    record: {
      id: leadId,
      outreach_subject: email.subject,
      outreach_body: email.body,
      outreach_score: email.score,
      outreach_personalization_notes: email.insights.join('\n'),
    }
  };

  try {
    const writeUrl = `/projects/${projectId}/integrations/${integrationId}/objects/lead`;
    console.log(`📡 Writing to URL: ${writeAmpersand.defaults.baseURL}${writeUrl}`);
    console.log(`📦 Request headers:`, {
      'X-Api-Key': writeAmpersand.defaults.headers['X-Api-Key'] ? 'SET' : 'MISSING',
      'Content-Type': writeAmpersand.defaults.headers['Content-Type']
    });
    console.log(`📝 Payload summary:`, {
      groupRef: writePayload.groupRef,
      type: writePayload.type,
      recordId: writePayload.record.id,
      payloadSize: JSON.stringify(writePayload).length
    });

    const response = await writeAmpersand.post(writeUrl, writePayload);
    console.log(`✅ Updated Salesforce lead ${leadId} - Response: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to update Salesforce lead ${leadId}:`, {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      projectId,
      integrationId,
      groupRef
    });

    if (error.response?.data) {
      console.error(`📋 Salesforce error details:`, error.response.data);

      // Log specific error causes if available
      if (error.response.data.causes) {
        console.error(`🔍 Error causes:`, error.response.data.causes);
      }
    }

    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AmperReach Backend',
    version: '1.0.0',
    leads: dataStore.leads.size,
    accounts: dataStore.accounts.size,
    activities: dataStore.activities.length
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`⚡ AmperReach backend running on port ${PORT}`);
  console.log(`\nWebhook endpoints:`);
  console.log(`📍 Lead backfill: http://localhost:${PORT}/webhooks/leadWebhook`);
  console.log(`📍 Account backfill: http://localhost:${PORT}/webhooks/accountWebhook`);
  console.log(`📍 Real-time updates: http://localhost:${PORT}/webhooks/leadRealtimeWebhook`);
  console.log(`📍 Frontend API: http://localhost:${PORT}/api/state`);
});
