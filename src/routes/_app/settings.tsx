import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

const TABS = ["Profile", "Team", "Notifications", "Integrations", "Danger zone"] as const;

function Settings() {
  const [tab, setTab] = useState<typeof TABS[number]>("Profile");
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>
      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <nav className="space-y-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition ${tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
              {t}
            </button>
          ))}
        </nav>
        <div className="border border-border bg-card rounded-lg p-6">
          {tab === "Profile" && (
            <div className="space-y-4">
              <Field label="Name" defaultValue="Marcus Kane" />
              <Field label="Email" defaultValue="marcus@webbplumbing.com" />
              <Field label="Phone" defaultValue="+1 (415) 555-0142" mono />
              <button onClick={() => toast.success("Profile saved")} className="mt-2 bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">Save changes</button>
            </div>
          )}
          {tab === "Team" && (
            <div className="space-y-3">
              {["Marcus Kane — Owner", "Priya Patel — Admin", "James Liu — Viewer"].map(m => (
                <div key={m} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">{m[0]}</div>
                    <span className="text-sm">{m}</span>
                  </div>
                  <button className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ))}
              <button className="text-sm text-primary">+ Invite teammate</button>
            </div>
          )}
          {tab === "Notifications" && (
            <div className="space-y-3">
              {["Daily call summary", "New voicemail", "Missed calls", "Weekly performance report"].map(n => (
                <label key={n} className="flex items-center justify-between text-sm">
                  <span>{n}</span>
                  <input type="checkbox" defaultChecked className="size-4 accent-primary" />
                </label>
              ))}
            </div>
          )}
          {tab === "Integrations" && (
            <div className="grid sm:grid-cols-2 gap-3">
              {["Google Calendar", "HubSpot", "Slack", "Zapier", "Salesforce", "Stripe"].map(n => (
                <div key={n} className="border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{n}</div>
                    <div className="text-xs text-muted-foreground">Not connected</div>
                  </div>
                  <button className="text-xs px-2 py-1 border border-border rounded hover:bg-accent">Connect</button>
                </div>
              ))}
            </div>
          )}
          {tab === "Danger zone" && (
            <div className="border border-destructive/30 rounded-lg p-4 bg-destructive/5">
              <div className="text-sm font-medium text-destructive">Delete workspace</div>
              <div className="text-xs text-muted-foreground mt-1">This permanently deletes your agent, call history, and team. This action cannot be undone.</div>
              <button onClick={() => toast.error("Are you sure? Click again to confirm.")} className="mt-3 text-xs px-3 py-1.5 border border-destructive text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition">Delete workspace</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, mono }: { label: string; defaultValue: string; mono?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <input defaultValue={defaultValue} className={`mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary ${mono ? "font-mono" : ""}`} />
    </div>
  );
}
