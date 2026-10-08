import { Webhook } from "svix";
import * as store from "./leads";

const verifier = new Webhook(process.env.AMPERSAND_WEBHOOK_SECRET!);

type Record = {
  fields: { [key: string]: string | null };
  mappedFields?: { [key: string]: string | null };
  subscribeEventType?: "create" | "update" | "delete" | "associationUpdate" | "other";
};

type Message = {
  action: "read" | "subscribe";
  readType?: "backfill" | "scheduled" | "triggered";
  groupRef: string;
  objectName: string;
  resultInfo: { type: "inline" | "url"; numRecords: number; downloadUrl?: string };
  result?: Record[];
};

// One plain sentence per delivery, named after the Ampersand action behind it.
function describe(message: Message, records: Record[]) {
  const count = `${records.length} lead${records.length === 1 ? "" : "s"}`;
  if (message.action === "read") {
    if (message.readType === "backfill") return `Imported ${count} from Salesforce`;
    if (message.readType === "scheduled") return `Scheduled sync: ${count}`;
    return `Synced ${count} from Salesforce`;
  }
  const name = (r: Record) => `${r.fields.firstname ?? ""} ${r.fields.lastname ?? ""}`.trim();
  if (records.length !== 1) return `${count} changed in Salesforce`;
  const [record] = records;
  return record!.subscribeEventType === "create"
    ? `${name(record!)} was created in Salesforce`
    : `${name(record!)} was updated in Salesforce`;
}

// Replies right away; Ampersand retries slow webhooks, which causes duplicates.
export async function receive(req: Request) {
  const body = await req.text();
  try {
    verifier.verify(body, Object.fromEntries(req.headers));
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }
  handle(JSON.parse(body)).catch(console.error);
  return new Response(null, { status: 204 });
}

async function handle(message: Message) {
  const records =
    message.resultInfo.type === "url"
      ? await fetch(message.resultInfo.downloadUrl!).then((res) => res.json() as Promise<Record[]>)
      : message.result!;

  for (const { fields, mappedFields } of records) {
    store.upsert(message.groupRef, {
      id: fields.id!,
      name: `${fields.firstname ?? ""} ${fields.lastname ?? ""}`.trim(),
      company: fields.company ?? "",
      title: fields.title ?? "",
      status: fields.status ?? "",
      ownerId: fields.ownerid ?? null,
      email: mappedFields?.outreach_email ?? null,
    });
  }
  store.log(message.groupRef, describe(message, records));
}
