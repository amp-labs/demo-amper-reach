# OutreachAI Backend

This backend handles Ampersand webhooks for the OutreachAI demo application.

## Overview

The backend serves three main purposes:
1. **Receives webhooks** from Ampersand (backfill and real-time)
2. **Generates AI emails** when leads are assigned
3. **Provides API** for frontend to fetch current state

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Start the server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:3001
   ```

4. **Expose webhooks (for testing):**
   ```bash
   ngrok http 3001
   # Use the ngrok URL in Ampersand webhook configuration
   ```

## Webhook Endpoints

### 1. Lead Backfill
**POST /webhooks/leadWebhook**
- Receives all existing leads when integration is connected
- Stores lead data in memory
- If lead is assigned but has no email, generates one
- Used during initial connection

### 2. Account Backfill  
**POST /webhooks/accountWebhook**
- Receives account data for company context
- Stores in memory for reference

### 3. Real-time Lead Updates
**POST /webhooks/leadRealtimeWebhook**
- Triggered when a lead's OwnerId changes (assignment)
- Generates personalized email immediately
- Updates Salesforce with email content

## API Endpoints

### GET /api/state
Returns current leads and activities for frontend:
```json
{
  "leads": [...],
  "activities": [...]
}
```

### GET /health
Health check endpoint with stats:
```json
{
  "status": "ok",
  "leads": 10,
  "activities": 25
}
```

## Email Generation Flow

1. **Webhook received** - Lead assignment detected
2. **Extract lead data** - Name, company, title
3. **Generate with AI** - OpenAI creates personalized email
4. **Update Salesforce** - Write to custom fields via Ampersand
5. **Update local state** - Store for frontend display

## Environment Variables

- `AMPERSAND_API_KEY` - Your Ampersand API key
- `AMPERSAND_PROJECT` - Your Ampersand project ID  
- `INSTALLATION_ID` - The Salesforce installation ID
- `OPENAI_API_KEY` - OpenAI key (optional, has fallback)
- `PORT` - Server port (default: 3001)

## Data Storage

For demo purposes, data is stored in-memory:
- Leads Map - All lead data with emails
- Accounts Map - Company information
- Activities Array - Recent webhook events

In production, you would use a proper database.

## Testing Webhooks

1. Start the server: `npm run dev`
2. Run ngrok: `ngrok http 3001`
3. Configure Ampersand webhooks with ngrok URL
4. Connect Salesforce in the frontend
5. Watch the console for webhook activity

## Troubleshooting

- **No webhooks received**: Check Ampersand webhook configuration
- **Email generation fails**: Verify OpenAI API key
- **Salesforce update fails**: Check Ampersand API key and installation ID
- **Frontend can't connect**: Ensure CORS is enabled and server is running
