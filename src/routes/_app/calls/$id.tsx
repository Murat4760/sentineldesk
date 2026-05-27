import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { mockCalls } from "@/lib/mock-data";
import { WaveformPlayer } from "@/components/effects/Waveform";
import { OutcomeBadge, SentimentDot } from "@/components/effects/SentimentBadge";
import { ArrowLeft, Flag, StickyNote, Download } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/calls/$id")({
  component: CallDetail,
});

function CallDetail() {
  const { id } = useParams({ from: "/_app/calls/$id" });
  const call = mockCalls.find(c => c.id === id) ?? mockCalls[0];
  const sentimentData = call.transcript.map((t, i) => ({
    t: t.time,
    v: 0.5 + Math.sin(i * 0.7) * 0.3 + (t.role === "ai" ? 0.1 : -0.05),
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to="/calls" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition mb-4">
        <ArrowLeft className="size-3" /> Back to calls
      </Link>

      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
            {call.callerName.split(" ").map(w => w[0]).join("")}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{call.callerName}</h1>
            <div className="font-mono text-xs text-muted-foreground">{call.callerPhone} · {new Date(call.timestamp).toLocaleString()}</div>
          </div>
          <div className="ml-3"><OutcomeBadge outcome={call.outcome} /></div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize"><SentimentDot sentiment={call.sentiment} /> {call.sentiment}</div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => toast.success("Call flagged for review")} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-md text-xs hover:bg-accent transition"><Flag className="size-3" /> Flag</button>
          <button onClick={() => toast("Note saved")} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-md text-xs hover:bg-accent transition"><StickyNote className="size-3" /> Note</button>
          <button onClick={() => toast.success("Transcript downloaded")} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-md text-xs hover:bg-accent transition"><Download className="size-3" /> Export</button>
        </div>
      </div>

      <WaveformPlayer duration={call.duration} />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-6">
        <div className="space-y-2">
          {call.transcript.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex ${t.role === "caller" ? "justify-end" : "justify-start"}`}
            >
              <div className="group max-w-[80%]">
                <div className={`px-3 py-2 rounded-lg text-sm ${t.role === "caller" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t.text}</div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                  {t.role === "ai" ? "Agent" : "Caller"} · {t.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <aside className="space-y-4">
          <Section title="Extracted">
            <Row k="Intent" v={call.extracted.intent} />
            <Row k="Service" v={call.extracted.service ?? "—"} />
            <Row k="Preferred date" v={call.extracted.preferredDate ?? "—"} />
            <Row k="Preferred time" v={call.extracted.preferredTime ?? "—"} />
            <Row k="New patient" v={call.extracted.isNewPatient ? "Yes" : "No"} />
          </Section>
          <Section title="Action items">
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-start gap-2"><span className="size-1.5 rounded-full bg-primary mt-1.5" /> Send appointment confirmation SMS</li>
              <li className="flex items-start gap-2"><span className="size-1.5 rounded-full bg-primary mt-1.5" /> Block calendar for {call.extracted.preferredDate}</li>
              <li className="flex items-start gap-2"><span className="size-1.5 rounded-full bg-primary mt-1.5" /> Flag as new patient intake</li>
            </ul>
          </Section>
          <Section title="Sentiment timeline">
            <div className="h-24 -mx-2">
              <ResponsiveContainer>
                <LineChart data={sentimentData}>
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[0, 1]} hide />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 11 }} />
                  <Line type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>
          <Section title="Notes">
            <div className="text-sm text-muted-foreground italic">{call.extracted.notes}</div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">{title}</div>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm border-b border-border last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{String(v)}</span>
    </div>
  );
}
