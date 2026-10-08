<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/ampersand-icon-dark.svg">
    <img src=".github/assets/ampersand-icon.svg" height="48" alt="Ampersand">
  </picture>
</p>

<h1 align="center">AmperReach</h1>

<p align="center">
  A demo sales app that connects to each customer's Salesforce through <a href="https://www.ampersand.ai">Ampersand</a>.
  <br>
  It reads their leads, hears about changes within seconds, and writes a draft email back to each lead.
</p>

<p align="center">
  <a href="https://github.com/amp-labs/demo-amper-reach/actions/workflows/ci.yml"><img src="https://github.com/amp-labs/demo-amper-reach/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://bun.com"><img src="https://img.shields.io/badge/bun-1.4-black?logo=bun" alt="Bun"></a>
  <a href="https://viteplus.dev"><img src="https://img.shields.io/badge/vite%2B-1.1-black" alt="Vite+"></a>
</p>

## What it shows

| Ampersand feature                                                             | Where                        |
| ----------------------------------------------------------------------------- | ---------------------------- |
| Install flow, where the customer connects Salesforce and maps the email field | `web/App.tsx`                |
| Read: leads from the last 30 days, then every hour                            | `amp.yaml`                   |
| On-demand read, behind **Sync now**                                           | `server/ampersand.ts`        |
| Subscribe: new leads and owner changes                                        | `amp.yaml`, `subscribe.yaml` |
| Write: the draft email, into the customer's mapped field                      | `server/ampersand.ts`        |
| Signed webhooks, acknowledged immediately                                     | `server/webhook.ts`          |

## Requirements

- [Bun](https://bun.com) — runs the app
- [Ampersand CLI](https://docs.ampersand.ai/cli/overview) — creates the project and deploys the integration
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/) — lets `amp tunnel` deliver webhooks to your machine
- A Salesforce org with an External Client App for Ampersand — see the [Salesforce guide](https://docs.ampersand.ai/provider-guides/salesforce)

> [!NOTE]
> `amp create:project`, `create:provider-app`, `tunnel`, and `update:installation` come from [open pull requests](https://github.com/amp-labs/cli/pulls?q=is%3Apr+is%3Aopen+author%3Acaiopizzol) to the Ampersand CLI and aren't released yet.

## Setup

1. Create the project and add your Salesforce app. `create:provider-app` asks for the consumer secret.

   ```sh
   amp login
   amp create:project amperreach
   amp create:provider-app salesforce -p amperreach --client-id <consumer key> \
     --scope api --scope refresh_token --scope offline_access
   ```

2. Deploy the webhook destination and the integration:

   ```sh
   amp deploy:destination -p amperreach -i destination.yaml
   amp deploy amp.yaml -p amperreach
   ```

3. Copy `.env.example` to `.env` and fill it in. Each comment says where to find the value. You need two API keys from the Ampersand dashboard: a full key and a "UI Library" key.

4. Start the app and route webhooks to it. Run each command in its own terminal:

   ```sh
   bun install && bun run dev
   amp listen --forward-to http://127.0.0.1:3000/webhooks/ampersand
   amp tunnel amperreach -p amperreach
   ```

5. Open http://localhost:3000 and connect Salesforce. Map the outreach email to a long text field, not the standard **Email** field, which rejects the draft. Leads from the last 30 days appear.

   To add a dedicated field, use the [custom field API](https://docs.ampersand.ai/manage-customer-schemas) with a `__c` name, such as `AmperReach_Email__c`.

6. Turn on live events. The install flow saves read and write, but not subscribe:

   ```sh
   amp list:installations <integration ID> -p amperreach
   amp update:installation <integration ID> <installation ID> -p amperreach -i subscribe.yaml
   ```

   Salesforce sends the first events 1–2 minutes later, sometimes up to 10. After that, changes arrive within seconds.

## Reset the demo

- To show the install flow again, click **Salesforce settings** in the app and uninstall. After you reconnect, repeat step 6.
- To clear the leads, restart `bun run dev`. The app keeps them in memory.

---

<p align="center">
  <a href="https://www.ampersand.ai">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/ampersand-logo-dark.svg">
      <img src=".github/assets/ampersand-logo.svg" height="24" alt="Ampersand">
    </picture>
  </a>
</p>
