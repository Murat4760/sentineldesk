import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { callsQueryOptions, buildCallsPerDay, buildOutcomeBreakdown, buildTopicBreakdown } from "@/lib/data";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/analytics")({
  component: Analytics,
});

function Analytics() {
  const { data: calls = [] } = useQuery(callsQueryOptions);
  const callsPerDay = buildCallsPerDay(calls);
  const outcomeBreakdown = buildOutcomeBreakdown(calls);
  const topicBreakdown = buildTopicBreakdown(calls);
  return (

    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Last 14 days</p>
        </div>
        <select className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option>Last 14 days</option><option>Last 30 days</option><option>This quarter</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Calls per day" className="lg:col-span-3">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={callsPerDay}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="calls" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g)" animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Outcome breakdown">
          <div className="h-56 flex items-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={outcomeBreakdown} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {outcomeBreakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {outcomeBreakdown.map(o => (
              <div key={o.name} className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-sm" style={{ background: o.color }} />
                <span>{o.name}</span>
                <span className="ml-auto font-mono">{o.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Topic distribution" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={topicBreakdown} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="topic" type="category" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Peak hours" className="lg:col-span-3">
          <Heatmap />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`border border-border bg-card rounded-lg p-4 ${className}`}>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">{title}</div>
      {children}
    </motion.div>
  );
}

function Heatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-px">
      <div></div>
      {hours.map(h => <div key={`h-${h}`} className="text-[9px] font-mono text-muted-foreground text-center">{h % 6 === 0 ? h : ""}</div>)}
      {days.map((d, di) => (
        <Fragment key={d}>
          <div className="text-[10px] text-muted-foreground flex items-center">{d}</div>
          {hours.map(h => {
            const i = (Math.sin(di * 1.2 + h * 0.5) + 1) / 2;
            const peak = h >= 8 && h <= 18 ? 1 : 0.2;
            const val = i * peak;
            return <div key={`${di}-${h}`} className="aspect-square rounded-sm" style={{ background: `color-mix(in oklch, var(--color-primary) ${val * 90}%, var(--color-muted))` }} title={`${d} ${h}:00 — ${Math.round(val * 30)} calls`} />;
          })}
        </Fragment>
      ))}
    </div>
  );
}
