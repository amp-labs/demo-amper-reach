# AmperReach Demo - Ampersand Salesforce Integration

A demo application showcasing how Ampersand enables real-time Salesforce integrations with automatic webhook processing.

## Overview

**AmperReach** demonstrates a simple but powerful use case:

1. **Connect to Salesforce** with one click using Ampersand
2. **Backfill existing leads** automatically on connection
3. **Receive webhooks** when leads are assigned to sales reps
4. **Generate personalized emails** automatically using AI
5. **Write back to Salesforce** custom fields

The app shows how Ampersand handles all the complex integration logic, letting you focus on your business logic.

## What This Demo Shows

- **Simple Connection**: One-click Salesforce OAuth via Ampersand
- **Automatic Backfill**: Existing leads are synced on connection
- **Real-time Webhooks**: Activity feed showing lead assignment events
- **Bi-directional Sync**: Reading leads and writing email data back
- **Live Status**: See which leads have AI-generated emails

## Quick Start

### 1. Start the Backend

The backend handles webhooks and stores data:

```bash
# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the backend
npm run dev
# Backend runs on http://localhost:3001
```

### 2. Configure Ampersand Webhooks

In your Ampersand dashboard, configure these webhook URLs:

- **Lead Backfill**: `http://localhost:3001/webhooks/leadWebhook`
- **Account Backfill**: `http://localhost:3001/webhooks/accountWebhook`
- **Real-time Updates**: `http://localhost:3001/webhooks/leadRealtimeWebhook`

For production or testing with real webhooks, use ngrok:

```bash
ngrok http 3001
# Use the ngrok URL in Ampersand instead of localhost
```

### 3. Start the Frontend

```bash
# From the root directory
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Connect Salesforce

1. Click "Connect Salesforce"
2. Complete OAuth flow
3. Map custom fields when prompted
4. Watch as leads are backfilled and processed

## How It Works

### Initial Connection

1. User connects Salesforce via Ampersand
2. Ampersand backfills recent leads (last 7 days)
3. Backend processes each lead:
   - Stores lead data
   - If assigned, generates AI email
   - Writes email to Salesforce custom fields
4. Dashboard shows all leads with email status

### Real-time Updates

When a lead is assigned in Salesforce:

1. Ampersand detects the change (OwnerId field)
2. Sends webhook to backend
3. Backend generates personalized email
4. Email saved to Salesforce
5. Dashboard updates automatically

## Project Structure

```
amperreach/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main view (polls backend)
│   │   ├── LeadTable.tsx          # Shows leads with email status
│   │   ├── ActivityFeed.tsx       # Real-time integration events
│   │   └── ConnectionSetup.tsx    # Salesforce connection screen
│   └── App.tsx                    # Main app with connection state
├── backend/
│   ├── server.js                  # Express server with webhooks
│   └── .env.example              # Environment variables template
└── ampersand/
    └── amp.yaml                   # Ampersand integration config
```

## Key Integration Points

### Ampersand Configuration (`amp.yaml`)

```yaml
read:
  objects:
    - objectName: lead
      destination: leadWebhook # Backfill endpoint

subscribe:
  objects:
    - objectName: lead
      destination: leadRealtimeWebhook # Real-time endpoint
      updateEvent:
        requiredWatchFields:
          - ownerid # Trigger on assignment
```

### Custom Fields Mapping

- `outreach_subject` - Email subject line
- `outreach_body` - Email content
- `outreach_score` - AI confidence score (0-100)
- `outreach_personalization_notes` - AI insights

### Backend Endpoints

- `POST /webhooks/leadWebhook` - Receives lead backfill data
- `POST /webhooks/accountWebhook` - Receives account data
- `POST /webhooks/leadRealtimeWebhook` - Receives real-time updates
- `GET /api/state` - Frontend polls this for current data

## Environment Variables

### Frontend (.env)

```
VITE_AMPERSAND_API_KEY=your_key
VITE_AMPERSAND_PROJECT_ID=your_project
VITE_SALESFORCE_INTEGRATION_NAME=ai-sales-assistant
```

### Backend (.env)

```
AMPERSAND_API_KEY=your_key
AMPERSAND_PROJECT=your_project_id
INSTALLATION_ID=your_installation_id
OPENAI_API_KEY=sk-your_openai_key  # Optional, has fallback
PORT=3001
```

## Development Tips

1. **Use ngrok for real webhooks**:

   ```bash
   ngrok http 3001
   ```

2. **Check backend logs** to see webhook activity

3. **Frontend polls every 5 seconds** - you'll see updates quickly

4. **Test the flow**:
   - Create a new lead in Salesforce (unassigned)
   - Assign it to someone
   - Watch the activity feed update
   - See the email status change

## What This Demo Is (and Isn't)

**This demo IS:**

- A showcase of Ampersand's webhook capabilities
- An example of backfill + real-time sync
- A demonstration of bi-directional Salesforce integration

**This demo is NOT:**

- A full email client
- Production-ready code
- A replacement for Salesforce UI

The focus is purely on showing how Ampersand makes complex integrations simple with webhooks and backfill.
