import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "@/components/effects/StatCard";
import { mockCalls, mockAppointments } from "@/lib/mock-data";
import { LiveWaveform } from "@/components/effects/Waveform";
import { OutcomeBadge, SentimentDot } from "@/components/effects/SentimentBadge";
import { useEffect, useState } from "react";
import { ChevronRight, Plus, Bot, BarChart3, PhoneCall } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CallDrawer } from "@/components/effects/CallDrawer";
import type { Call } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [feed, setFeed] = useState(mockCalls.slice(0, 8));
  const [drawer, setDrawer] = useState<Call | null>(null);

  useEffect(() => {
    const i = setInterval(() => {
      setFeed(prev => {
        const pool = mockCalls.filter(c => !prev.find(p => p.id === c.id));
        if (!pool.length) return prev;
        const next = pool[Math.floor(Math.random() * pool.length)];
        return [{ ...next, timestamp: new Date().toISOString() }, ...prev].slice(0, 10);
      });
    }, 22000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good morning, Marcus</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your agent today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-border rounded-md bg-card">
            <span className="size-1.5 rounded-full bg-[color:var(--color-success)] pulse-ring" />
            Agent online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Calls today" value={47} trend={12} index={0} />
        <StatCard label="Appointments" value={12} trend={8} index={1} />
        <StatCard label="Avg duration" value={154} suffix="s" trend={-4} index={2} sub="2:34 per call" />
        <StatCard label="Minutes used" value={847} sub="of 2,000 this month" index={3} />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Live call feed */}
        <div className="lg:col-span-2 border border-border bg-card rounded-lg">
          <div className="h-12 px-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Live feed</span>
              <span className="text-xs text-muted-foreground">Updates in real time</span>
            </div>
            <LiveWaveform bars={10} className="h-4" />
          </div>
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {feed.map((c) => (
                <motion.button
                  key={c.id + c.timestamp}
                  layout
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setDrawer(c)}
                  className="group w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {c.callerName.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{c.callerName}</span>
                      <SentimentDot sentiment={c.sentiment} />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{c.callerPhone}</div>
                  </div>
                  <div className="hidden md:flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {Math.floor(c.duration / 60)}:{String(c.duration % 60).padStart(2, "0")}
                    </span>
                    <OutcomeBadge outcome={c.outcome} />
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {formatDistanceToNow(new Date(c.timestamp), { addSuffix: false })}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          <div className="border border-border bg-card rounded-lg">
            <div className="h-12 px-4 border-b border-border flex items-center">
              <span className="text-sm font-medium">Today's appointments</span>
            </div>
            <div className="divide-y divide-border">
              {mockAppointments.slice(0, 4).map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="text-center w-12 shrink-0">
                    <div className="font-mono text-sm font-semibold">{a.time}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.customer}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.service}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card rounded-lg p-4 space-y-2">
            <div className="text-sm font-medium mb-2">Quick actions</div>
            <Action icon={PhoneCall} label="Test call" />
            <Action icon={Bot} label="Edit agent" to="/agent" />
            <Action icon={BarChart3} label="View analytics" to="/analytics" />
            <Action icon={Plus} label="New appointment" to="/appointments" />
          </div>
        </div>
      </div>

      <CallDrawer call={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

function Action({ icon: Icon, label, to }: { icon: any; label: string; to?: string }) {
  const inner = (
    <div className="group flex items-center gap-2.5 px-2 py-2 -mx-2 rounded-md text-sm text-foreground hover:bg-accent transition-colors">
      <Icon className="size-4 text-muted-foreground" />
      {label}
      <ChevronRight className="size-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <button className="w-full text-left">{inner}</button>;
}
