import app from "../web/index.html";
import { syncLeads, updateLead } from "./ampersand";
import * as store from "./leads";
import { receive } from "./webhook";

// The demo has one signed-in customer. A real app reads this from the session.
const groupRef = "acme";

Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  development: process.env.NODE_ENV !== "production",
  routes: {
    "/": app,

    "/webhooks/ampersand": { POST: receive },

    "/api/leads": { GET: () => Response.json(store.list(groupRef)) },

    "/api/sync": {
      POST: async () => {
        await syncLeads(groupRef);
        return new Response(null, { status: 202 });
      },
    },

    "/api/leads/:id/email": {
      POST: async (req) => {
        const lead = store.get(groupRef, req.params.id);
        if (!lead) return new Response("Lead not found", { status: 404 });

        const email = store.draftEmail(lead);
        await updateLead(groupRef, lead.id, { outreach_email: email });
        store.upsert(groupRef, { ...lead, email });
        store.log(groupRef, `Saved a draft for ${lead.name} to Salesforce`);
        return Response.json({ email });
      },
    },
  },
  error(err) {
    console.error(err);
    return new Response(err.message, { status: 502 });
  },
});
