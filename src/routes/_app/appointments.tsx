import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { mockAppointments } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

export const Route = createFileRoute("/_app/appointments")({
  component: Appointments,
});

type View = "month" | "week" | "day";

function Appointments() {
  const [view, setView] = useState<View>("week");
  const [selected, setSelected] = useState<typeof mockAppointments[number] | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mockAppointments.length} upcoming</p>
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
          <div className="text-sm font-medium px-2">May 2026</div>
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
          {view === "month" && <MonthGrid onSelect={setSelected} />}
          {view === "week" && <WeekGrid onSelect={setSelected} />}
          {view === "day" && <DayList onSelect={setSelected} />}
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
                <Row k="Duration" v={`${selected.duration} min`} />
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

function MonthGrid({ onSelect }: { onSelect: (a: any) => void }) {
  const days = Array.from({ length: 35 });
  return (
    <div className="grid grid-cols-7">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
        <div key={d} className="p-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-b border-r border-border last:border-r-0">{d}</div>
      ))}
      {days.map((_, i) => {
        const day = i - 3;
        const appts = mockAppointments.filter((_, ai) => ai % 14 === i % 14).slice(0, 2);
        return (
          <div key={i} className="min-h-24 border-r border-b border-border last:border-r-0 p-1.5">
            <div className={`text-xs font-mono ${day < 1 || day > 31 ? "text-muted-foreground/40" : ""}`}>{day > 0 && day <= 31 ? day : ""}</div>
            <div className="mt-1 space-y-1">
              {day > 0 && day <= 31 && appts.map(a => (
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

function WeekGrid({ onSelect }: { onSelect: (a: any) => void }) {
  const days = ["Mon 27", "Tue 28", "Wed 29", "Thu 30", "Fri 31", "Sat 1", "Sun 2"];
  const hours = Array.from({ length: 10 }).map((_, i) => i + 8);
  return (
    <div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        <div></div>
        {days.map(d => <div key={d} className="px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border">{d}</div>)}
      </div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        {hours.map((h, hi) => (
          <Fragment key={h}>
            <div className="px-2 py-3 text-[10px] font-mono text-muted-foreground border-b border-border text-right">{h}:00</div>
            {Array.from({ length: 7 }).map((_, di) => {
              const idx = hi * 7 + di;
              const a = mockAppointments[idx % mockAppointments.length];
              const show = idx % 3 === 0;
              return (
                <div key={di} className="border-l border-b border-border p-1 min-h-12 relative">
                  {show && (
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

function DayList({ onSelect }: { onSelect: (a: any) => void }) {
  return (
    <div className="divide-y divide-border">
      {mockAppointments.slice(0, 10).map(a => (
        <button key={a.id} onClick={() => onSelect(a)} className="w-full grid grid-cols-[80px_1fr_120px_80px] gap-4 items-center px-4 py-3 hover:bg-accent/40 transition text-left">
          <span className="font-mono text-sm">{a.time}</span>
          <div>
            <div className="text-sm font-medium">{a.customer}</div>
            <div className="text-xs text-muted-foreground">{a.service}</div>
          </div>
          <span className="text-xs text-muted-foreground">{a.duration} min</span>
          <span className="text-xs capitalize">{a.status}</span>
        </button>
      ))}
    </div>
  );
}
