import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentsQueryOptions, type Appointment } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

export const Route = createFileRoute("/_app/appointments")({
  component: Appointments,
});

type View = "month" | "week" | "day";

function Appointments() {
  const { data: appointments = [] } = useQuery(appointmentsQueryOptions);
  const [view, setView] = useState<View>("week");
  const [selected, setSelected] = useState<Appointment | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{appointments.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex border border-border rounded-md bg-card p-0.5">
            {(["month", "week", "day"] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`relative px-3 py-1 text-xs font-medium rounded transition capitalize ${view === v ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {view === v && <motion.div layoutId="view-active" className="absolute inset-0 bg-accent rounded" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>
          <button className="size-8 border border-border rounded-md hover:bg-accent flex items-center justify-center"><ChevronLeft className="size-3.5" /></button>
          <div className="text-sm font-medium px-2">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
          <button className="size-8 border border-border rounded-md hover:bg-accent flex items-center justify-center"><ChevronRight className="size-3.5" /></button>
          <button className="ml-2 inline-flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90"><Plus className="size-3.5" /> New</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border border-border bg-card rounded-lg overflow-hidden"
        >
          {appointments.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-muted-foreground">No appointments yet.</div>
          ) : view === "month" ? (
            <MonthGrid appointments={appointments} onSelect={setSelected} />
          ) : view === "week" ? (
            <WeekGrid appointments={appointments} onSelect={setSelected} />
          ) : (
            <DayList appointments={appointments} onSelect={setSelected} />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-popover border border-border rounded-xl z-50 shadow-2xl">
              <div className="h-12 px-4 border-b border-border flex items-center justify-between">
                <div className="text-sm font-medium">Appointment details</div>
                <button onClick={() => setSelected(null)} className="size-8 rounded-md hover:bg-accent flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <Row k="Customer" v={selected.customer} />
                <Row k="Service" v={selected.service} />
                <Row k="Date" v={selected.date} />
                <Row k="Time" v={selected.time} />
                <Row k="Status" v={selected.status} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium capitalize">{v}</span></div>;
}

function MonthGrid({ appointments, onSelect }: { appointments: Appointment[]; onSelect: (a: Appointment) => void }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 });

  return (
    <div className="grid grid-cols-7">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
        <div key={d} className="p-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-b border-r border-border last:border-r-0">{d}</div>
      ))}
      {cells.map((_, i) => {
        const day = i - firstDay + 1;
        const valid = day >= 1 && day <= daysInMonth;
        const dateStr = valid ? new Date(year, month, day).toISOString().slice(0, 10) : "";
        const appts = valid ? appointments.filter(a => a.date === dateStr).slice(0, 3) : [];
        return (
          <div key={i} className="min-h-24 border-r border-b border-border last:border-r-0 p-1.5">
            <div className={`text-xs font-mono ${!valid ? "text-muted-foreground/40" : ""}`}>{valid ? day : ""}</div>
            <div className="mt-1 space-y-1">
              {appts.map(a => (
                <button key={a.id} onClick={() => onSelect(a)} className="w-full text-left px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary truncate hover:bg-primary/20">
                  {a.time} {a.customer.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekGrid({ appointments, onSelect }: { appointments: Appointment[]; onSelect: (a: Appointment) => void }) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: 11 }).map((_, i) => i + 8);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border min-w-[640px]">
        <div></div>
        {days.map(d => (
          <div key={d.toISOString()} className="px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border">
            {d.toLocaleDateString("en-US", { weekday: "short" })} {d.getDate()}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[640px]">
        {hours.map((h) => (
          <Fragment key={h}>
            <div className="px-2 py-3 text-[10px] font-mono text-muted-foreground border-b border-border text-right">{h}:00</div>
            {days.map((d) => {
              const dateStr = d.toISOString().slice(0, 10);
              const a = appointments.find(ap => ap.date === dateStr && Number(ap.time.slice(0, 2)) === h);
              return (
                <div key={d.toISOString() + h} className="border-l border-b border-border p-1 min-h-12 relative">
                  {a && (
                    <motion.button
                      layout
                      onClick={() => onSelect(a)}
                      className="absolute inset-1 rounded bg-primary/15 border border-primary/30 text-[10px] text-left p-1 text-primary hover:bg-primary/25 transition"
                    >
                      <div className="font-medium truncate">{a.customer.split(" ")[0]}</div>
                      <div className="opacity-70 truncate">{a.service}</div>
                    </motion.button>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function DayList({ appointments, onSelect }: { appointments: Appointment[]; onSelect: (a: Appointment) => void }) {
  const sorted = [...appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div className="divide-y divide-border">
      {sorted.map(a => (
        <button key={a.id} onClick={() => onSelect(a)} className="w-full grid grid-cols-[160px_1fr_80px] gap-4 items-center px-4 py-3 hover:bg-accent/40 transition text-left">
          <span className="font-mono text-sm">{a.date} {a.time}</span>
          <div>
            <div className="text-sm font-medium">{a.customer}</div>
            <div className="text-xs text-muted-foreground">{a.service}</div>
          </div>
          <span className="text-xs capitalize">{a.status}</span>
        </button>
      ))}
    </div>
  );
}
