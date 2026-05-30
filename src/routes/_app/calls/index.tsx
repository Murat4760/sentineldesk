import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { callsQueryOptions } from "@/lib/data";
import { OutcomeBadge, SentimentDot } from "@/components/effects/SentimentBadge";
import { Search, Download, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/calls/")({
  component: CallsList,
});

const OUTCOMES = ["booked", "info", "missed", "voicemail", "transferred"] as const;

function CallsList() {
  const { data: calls = [] } = useQuery(callsQueryOptions);
  const [q, setQ] = useState("");
  const [selectedOut, setSelectedOut] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => calls.filter(c => {
    if (selectedOut.length && !selectedOut.includes(c.outcome)) return false;
    if (q && !`${c.callerName} ${c.callerPhone}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [calls, q, selectedOut]);


  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calls</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} of {calls.length} calls</p>
        </div>
        <button
          onClick={() => toast.success("Exported calls.csv", { description: `${filtered.length} rows · 12 KB` })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-md text-sm hover:border-foreground/20 transition"
        >
          <Download className="size-3.5" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search name or phone…"
            className="w-full h-9 pl-8 pr-3 rounded-md border border-input bg-card text-sm outline-none focus:border-primary transition"
          />
        </div>
        <div className="flex items-center gap-1">
          {OUTCOMES.map(o => {
            const on = selectedOut.includes(o);
            return (
              <button
                key={o}
                onClick={() => setSelectedOut(s => on ? s.filter(x => x !== o) : [...s, o])}
                className={`text-[11px] uppercase tracking-wide font-medium px-2 py-1 rounded border transition ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {o}
              </button>
            );
          })}
        </div>
        {selectedIds.size > 0 && (
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{selectedIds.size} selected</span>
            <button onClick={() => { toast.success(`Archived ${selectedIds.size} calls`); setSelectedIds(new Set()); }} className="px-2 py-1 rounded border border-border hover:bg-accent transition">Archive</button>
          </div>
        )}
      </div>

      <div className="border border-border bg-card rounded-lg overflow-hidden">
        <div className="grid grid-cols-[36px_1fr_180px_80px_120px_120px_120px_36px] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div></div>
          <div>Caller</div>
          <div>Phone</div>
          <div>Duration</div>
          <div>Outcome</div>
          <div>Sentiment</div>
          <div className="text-right">Time</div>
          <div></div>
        </div>
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02, duration: 0.2 }}
          >
            <Link to="/calls/$id" params={{ id: c.id }} className="group grid grid-cols-[36px_1fr_180px_80px_120px_120px_120px_36px] gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/40 transition-colors items-center">
              <div onClick={(e) => { e.preventDefault(); toggle(c.id); }} className="flex items-center">
                <span className={`size-4 rounded border ${selectedIds.has(c.id) ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
                  {selectedIds.has(c.id) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                  {c.callerName.split(" ").map(w => w[0]).join("")}
                </div>
                <span className="text-sm font-medium truncate">{c.callerName}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">{c.callerPhone}</div>
              <div className="font-mono text-xs text-muted-foreground tabular-nums">{Math.floor(c.duration / 60)}:{String(c.duration % 60).padStart(2, "0")}</div>
              <div><OutcomeBadge outcome={c.outcome} /></div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize"><SentimentDot sentiment={c.sentiment} /> {c.sentiment}</div>
              <div className="text-xs text-muted-foreground text-right">{formatDistanceToNow(new Date(c.timestamp), { addSuffix: true })}</div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </Link>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">No calls match your filters.</div>
        )}
      </div>
    </div>
  );
}
