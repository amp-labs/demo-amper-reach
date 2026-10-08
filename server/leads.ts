export type Lead = {
  id: string;
  name: string;
  company: string;
  title: string;
  status: string;
  ownerId: string | null;
  email: string | null;
};

export type Activity = { at: string; text: string };

// In-memory store, keyed by customer (groupRef), so tenants stay separate.
const leads = new Map<string, Map<string, Lead>>();
const activity = new Map<string, Activity[]>();

export function list(groupRef: string) {
  return {
    leads: [...(leads.get(groupRef)?.values() ?? [])],
    activity: activity.get(groupRef) ?? [],
  };
}

export function upsert(groupRef: string, lead: Lead) {
  if (!leads.has(groupRef)) leads.set(groupRef, new Map());
  leads.get(groupRef)!.set(lead.id, lead);
}

export function get(groupRef: string, id: string) {
  return leads.get(groupRef)?.get(id);
}

export function log(groupRef: string, text: string) {
  const entries = activity.get(groupRef) ?? [];
  activity.set(groupRef, [{ at: new Date().toISOString(), text }, ...entries].slice(0, 30));
}

// A fixed template keeps every demo take identical.
export function draftEmail(lead: Lead) {
  const first = lead.name.split(" ")[0];
  return `Hi ${first},\n\nI saw you lead ${lead.title || "the team"} at ${lead.company}. Teams like yours use AmperReach to follow up with every new lead the moment it's assigned.\n\nOpen to a 15-minute call next week?`;
}
