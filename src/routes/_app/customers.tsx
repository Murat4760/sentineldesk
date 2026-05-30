import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customersQueryOptions } from "@/lib/data";
import { motion } from "framer-motion";
import { LayoutGrid, List, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/customers")({
  component: Customers,
});

function Customers() {
  const { data: customers = [] } = useQuery(customersQueryOptions);
  const [view, setView] = useState<"table" | "card">("table");
  const [q, setQ] = useState("");
  const filtered = customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));


  const tagColor = (t: string) => ({ vip: "bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)]", new: "bg-primary/15 text-primary", repeat: "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]", "follow-up": "bg-muted text-muted-foreground" } as any)[t] ?? "bg-muted text-muted-foreground";

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mockCustomers.length} contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="h-9 pl-8 pr-3 rounded-md border border-input bg-card text-sm outline-none focus:border-primary w-56" />
          </div>
          <div className="flex border border-border rounded-md bg-card p-0.5">
            <button onClick={() => setView("table")} className={`size-7 rounded flex items-center justify-center ${view === "table" ? "bg-accent text-foreground" : "text-muted-foreground"}`}><List className="size-3.5" /></button>
            <button onClick={() => setView("card")} className={`size-7 rounded flex items-center justify-center ${view === "card" ? "bg-accent text-foreground" : "text-muted-foreground"}`}><LayoutGrid className="size-3.5" /></button>
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_180px_220px_80px_120px_120px] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Customer</div><div>Phone</div><div>Email</div><div>Calls</div><div>LTV</div><div className="text-right">Last contact</div>
          </div>
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="grid grid-cols-[1fr_180px_220px_80px_120px_120px] gap-3 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-accent/40 transition">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">{c.name.split(" ").map(w => w[0]).join("")}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="flex gap-1 mt-0.5">
                    {c.tags.map(t => <span key={t} className={`text-[9px] px-1 py-0.5 rounded ${tagColor(t)}`}>{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="font-mono text-xs text-muted-foreground truncate">{c.phone}</div>
              <div className="text-xs text-muted-foreground truncate">{c.email}</div>
              <div className="font-mono text-xs tabular-nums">{c.totalCalls}</div>
              <div className="font-mono text-xs tabular-nums">${c.lifetimeValue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground text-right">{formatDistanceToNow(new Date(c.lastContact), { addSuffix: true })}</div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border border-border bg-card rounded-lg p-4 hover:border-foreground/20 transition">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{c.name.split(" ").map(w => w[0]).join("")}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">{c.phone}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-1">{c.tags.map(t => <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded ${tagColor(t)}`}>{t}</span>)}</div>
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                <div><div className="text-muted-foreground">Calls</div><div className="font-mono font-medium">{c.totalCalls}</div></div>
                <div><div className="text-muted-foreground">LTV</div><div className="font-mono font-medium">${c.lifetimeValue.toLocaleString()}</div></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
