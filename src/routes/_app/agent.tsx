import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { voices } from "@/lib/mock-data";
import { StaticWaveform } from "@/components/effects/Waveform";
import { Play, GripVertical, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/agent")({
  component: Agent,
});

const TABS = ["Persona", "Knowledge", "Prompt", "Behavior", "Hours"] as const;

function Agent() {
  const [tab, setTab] = useState<typeof TABS[number]>("Persona");
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Agent</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Customize how your AI receptionist sounds and behaves.</p>
      </div>

      <div className="relative border-b border-border flex gap-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
            {tab === t && <motion.div layoutId="tab-underline" className="absolute left-2 right-2 -bottom-px h-0.5 bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6">
          {tab === "Persona" && <PersonaTab />}
          {tab === "Knowledge" && <KnowledgeTab />}
          {tab === "Prompt" && <PromptTab />}
          {tab === "Behavior" && <BehaviorTab />}
          {tab === "Hours" && <HoursTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PersonaTab() {
  const [v, setV] = useState(voices[0].id);
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Voice</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {voices.map((voice, i) => (
            <button key={voice.id} onClick={() => setV(voice.id)} className={`text-left border rounded-lg p-3 transition ${v === voice.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{voice.name}</span>
                <span className="size-6 rounded-full border border-border flex items-center justify-center"><Play className="size-2.5 ml-0.5" /></span>
              </div>
              <StaticWaveform seed={i + 1} bars={30} className="mt-2 h-6" />
              <div className="mt-1.5 text-[10px] text-muted-foreground">{voice.traits}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Language</label>
        <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-card text-sm outline-none focus:border-primary">
          <option>English (US)</option><option>English (UK)</option><option>Spanish</option><option>French</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Greeting</label>
        <textarea defaultValue="Hi! Thanks for calling Smile Dental. How can I help you today?" className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-card text-sm outline-none focus:border-primary min-h-20" />
      </div>
    </div>
  );
}

function KnowledgeTab() {
  const [services, setServices] = useState(["Teeth cleaning — $120", "Whitening — $250", "Crown — $1,200", "Root canal — $900", "Consultation — Free"]);
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Services & pricing</div>
        <div className="border border-border bg-card rounded-lg divide-y divide-border">
          {services.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5">
              <GripVertical className="size-4 text-muted-foreground cursor-grab" />
              <input defaultValue={s} className="flex-1 bg-transparent text-sm outline-none" />
              <button onClick={() => setServices(p => p.filter((_, j) => j !== i))} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">FAQ</div>
        <div className="space-y-2">
          {["Do you accept insurance?", "What's your cancellation policy?", "Do you have weekend hours?"].map(q => (
            <div key={q} className="border border-border bg-card rounded-lg p-3">
              <div className="text-sm font-medium">{q}</div>
              <textarea className="mt-2 w-full bg-transparent text-sm outline-none min-h-12 text-muted-foreground" placeholder="Answer…" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromptTab() {
  const tpl = `You are Ava, the AI receptionist for Smile Dental.
Speak warmly and concisely. Confirm dates and times.
Always offer two appointment slots. Never make medical claims.
Hand off to a human if the caller asks for the owner.`;
  const [val, setVal] = useState(tpl);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">System prompt</div>
        <button onClick={() => { setVal(tpl); toast("Reset to template"); }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><RotateCcw className="size-3" /> Reset</button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden bg-[#0a0a0a]">
        <textarea
          value={val}
          onChange={e => setVal(e.target.value)}
          className="w-full min-h-72 p-4 bg-transparent text-[#e5e5e5] font-mono text-xs outline-none resize-none"
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground font-mono">{val.length} characters · {val.split(/\s+/).length} words</div>
    </div>
  );
}

function BehaviorTab() {
  return (
    <div className="space-y-6 max-w-lg">
      {[
        { label: "Interruption sensitivity", value: 60 },
        { label: "Response speed", value: 75 },
        { label: "Verbosity", value: 40 },
      ].map(s => (
        <div key={s.label}>
          <div className="flex justify-between text-sm"><span>{s.label}</span><span className="font-mono text-muted-foreground">{s.value}</span></div>
          <input type="range" defaultValue={s.value} className="w-full mt-2 accent-primary" />
        </div>
      ))}
      <div className="space-y-3 pt-2">
        {["Allow voicemail when busy", "Transfer to human on request", "Take detailed notes", "Send SMS confirmations"].map(t => (
          <label key={t} className="flex items-center justify-between text-sm">
            <span>{t}</span>
            <input type="checkbox" defaultChecked className="size-4 accent-primary" />
          </label>
        ))}
      </div>
    </div>
  );
}

function HoursTab() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 });
  const [active, setActive] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (let d = 0; d < 5; d++) for (let h = 8; h < 18; h++) s.add(`${d}-${h}`);
    return s;
  });
  const toggle = (k: string) => setActive(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-3">Click cells to toggle active hours. Active = agent answers.</div>
      <div className="border border-border bg-card rounded-lg overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(24,1fr)]">
          <div></div>
          {hours.map(h => <div key={h} className="text-[9px] font-mono text-muted-foreground text-center py-1">{h}</div>)}
          {days.map((d, di) => (
            <>
              <div key={d} className="text-xs font-medium px-2 py-1 border-t border-border flex items-center">{d}</div>
              {hours.map(h => {
                const k = `${di}-${h}`;
                return <button key={k} onClick={() => toggle(k)} className={`border-t border-l border-border h-6 transition ${active.has(k) ? "bg-primary/40 hover:bg-primary/60" : "hover:bg-accent"}`} />;
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
