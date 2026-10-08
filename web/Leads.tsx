import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  company: string;
  title: string;
  status: string;
  ownerId: string | null;
  email: string | null;
};
type Activity = { at: string; text: string };

// Salesforce's default statuses start with "Closed" once a lead is done.
const isOpen = (lead: Lead) => !lead.status.startsWith("Closed");

export function Leads({ emailField }: { emailField: string | undefined }) {
  const [data, setData] = useState<{ leads: Lead[]; activity: Activity[] }>({
    leads: [],
    activity: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = () =>
    fetch("/api/leads")
      .then((res) => res.json())
      .then(setData);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, 2000);
    return () => clearInterval(timer);
  }, []);

  // `busy` holds the URL in flight, so only that button shows progress.
  const run = async (url: string) => {
    setError(null);
    setBusy(url);
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) setError(await res.text());
    await refresh();
    setBusy(null);
  };

  const write = async (lead: Lead) => {
    await run(`/api/leads/${lead.id}/email`);
    setOpenId(lead.id);
  };

  const open = data.leads.filter(isOpen);
  const closed = data.leads.filter((lead) => !isOpen(lead));

  const row = (lead: Lead) => (
    <li key={lead.id} className={openId === lead.id ? "lead expanded" : "lead"}>
      <div className="lead-row">
        <div>
          <strong>{lead.name}</strong>
          <div className="muted">
            {lead.title} · {lead.company}
          </div>
        </div>
        <span className="status">{lead.status}</span>
        <div className="actions">
          {lead.email ? (
            <button className="link" onClick={() => setOpenId(openId === lead.id ? null : lead.id)}>
              {openId === lead.id ? "Hide email" : "View email"}
            </button>
          ) : (
            <button disabled={busy !== null} onClick={() => write(lead)}>
              {busy === `/api/leads/${lead.id}/email` ? "Writing…" : "Write email"}
            </button>
          )}
        </div>
      </div>
      {openId === lead.id && lead.email && (
        <div className="draft">
          <pre>{lead.email}</pre>
          <p className="muted">
            Saved to Salesforce in <code>{emailField ?? "your mapped field"}</code>
          </p>
        </div>
      )}
    </li>
  );

  return (
    <main className="grid">
      <section className="panel">
        <header className="panel-header">
          <h2>Leads</h2>
          <button disabled={busy !== null} onClick={() => run("/api/sync")}>
            {busy === "/api/sync" ? "Syncing…" : "Sync now"}
          </button>
        </header>
        {error && <p className="error">{error}</p>}
        {data.leads.length === 0 ? (
          <p className="empty">No leads yet. They appear here after Salesforce is read.</p>
        ) : (
          <>
            <h3 className="group">Needs outreach · {open.length}</h3>
            <ul className="leads">{open.map(row)}</ul>
            {closed.length > 0 && (
              <details className="closed">
                <summary className="group">Closed · {closed.length}</summary>
                <ul className="leads">{closed.map(row)}</ul>
              </details>
            )}
          </>
        )}
      </section>

      <aside className="panel">
        <header className="panel-header">
          <h2>Activity</h2>
        </header>
        {data.activity.length === 0 && <p className="empty">Nothing yet.</p>}
        <ul className="activity">
          {data.activity.map((entry) => (
            <li key={entry.at + entry.text}>
              <span>{entry.text}</span>
              <time className="muted">{new Date(entry.at).toLocaleTimeString()}</time>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
