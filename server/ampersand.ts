const project = process.env.AMPERSAND_PROJECT_ID!;
const integration = process.env.AMPERSAND_INTEGRATION_ID!;
const headers = {
  "X-Api-Key": process.env.AMPERSAND_API_KEY!,
  "Content-Type": "application/json",
};

// Writes `fields` to one Salesforce lead. Mapped names such as
// `outreach_email` are translated to each customer's chosen field.
export async function updateLead(groupRef: string, id: string, fields: Record<string, string>) {
  const url = `https://write.withampersand.com/v1/projects/${project}/integrations/${integration}/objects/lead`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      groupRef,
      type: "update",
      mode: "synchronous",
      record: { id, ...fields },
    }),
  });
  if (!res.ok) throw new Error(`Write failed (${res.status}): ${await res.text()}`);
}

// Asks Ampersand to read leads again; results arrive at the webhook.
export async function syncLeads(groupRef: string) {
  const url = `https://read.withampersand.com/v1/projects/${project}/integrations/${integration}/objects/lead`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ groupRef, mode: "async" }),
  });
  if (!res.ok) throw new Error(`Sync failed (${res.status}): ${await res.text()}`);
}
