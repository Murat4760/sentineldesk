import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Play, Phone } from "lucide-react";
import { voices } from "@/lib/mock-data";
import confetti from "canvas-confetti";
import { StaticWaveform } from "@/components/effects/Waveform";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const steps = ["Business", "Voice", "Greeting", "Phone"];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [voice, setVoice] = useState(voices[0].id);
  const [greeting, setGreeting] = useState<"professional" | "friendly" | "casual">("friendly");
  const [provisioning, setProvisioning] = useState(false);
  const [provisionedNumber, setProvisionedNumber] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const nav = useNavigate();

  const next = () => {
    if (step === 3 && !provisionedNumber) {
      runProvisioning();
      return;
    }
    if (step === 3) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => nav({ to: "/dashboard" }), 800);
      return;
    }
    setStep(s => s + 1);
  };

  const runProvisioning = () => {
    setProvisioning(true);
    const lines = [
      "$ ringly provision --area=415",
      "→ Reserving phone number…",
      "→ Configuring carrier routes…",
      "→ Linking agent persona…",
      "✓ Number assigned: +1 (415) 555-0142",
    ];
    lines.forEach((l, i) => setTimeout(() => {
      setTerminalLines(prev => [...prev, l]);
      if (i === lines.length - 1) {
        setProvisionedNumber("+1 (415) 555-0142");
        setProvisioning(false);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.4 } });
      }
    }, 600 * (i + 1)));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border h-14 px-6 flex items-center">
        <div className="flex items-center gap-2 font-semibold">
          <div className="size-6 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">R</div>
          Ringly
        </div>
        <div className="ml-auto text-xs text-muted-foreground font-mono">Step {step + 1} of {steps.length}</div>
      </div>

      <div className="px-6 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <div className="mt-3 flex justify-between">
            {steps.map((s, i) => (
              <div key={s} className={`text-xs ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto"
          >
            {step === 0 && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Tell us about your business</h1>
                <p className="mt-1 text-sm text-muted-foreground">We use this to personalize how the agent answers.</p>
                <div className="mt-8 grid gap-4">
                  <Field label="Business name" placeholder="Smile Dental" />
                  <Field label="Industry" placeholder="Dental practice" />
                  <Field label="Address" placeholder="1430 Mission St, San Francisco" />
                  <Field label="Hours" placeholder="Mon–Fri 8am–6pm" />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Pick a voice</h1>
                <p className="mt-1 text-sm text-muted-foreground">Tap a card to hear a sample.</p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {voices.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setVoice(v.id)}
                      className={`group text-left border rounded-lg p-4 transition ${voice === v.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{v.name}</div>
                        <div className="size-7 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition">
                          <Play className="size-3 ml-0.5" />
                        </div>
                      </div>
                      <StaticWaveform seed={i + 1} bars={40} className="mt-3 h-8" />
                      <div className="mt-2 text-xs text-muted-foreground">{v.traits}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{v.accent}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Greeting style</h1>
                <p className="mt-1 text-sm text-muted-foreground">How should your agent answer the phone?</p>
                <div className="mt-8 grid gap-3">
                  {[
                    { id: "professional", label: "Professional", ex: "Thank you for calling Smile Dental, this is Ava. How may I direct your call?" },
                    { id: "friendly", label: "Friendly", ex: "Hi! Thanks for calling Smile Dental. How can I help you today?" },
                    { id: "casual", label: "Casual", ex: "Hey, Smile Dental — what can I do for ya?" },
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setGreeting(g.id as any)}
                      className={`text-left border rounded-lg p-4 transition ${greeting === g.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{g.label}</div>
                        {greeting === g.id && <Check className="size-4 text-primary" />}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground italic">"{g.ex}"</div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Provision your number</h1>
                <p className="mt-1 text-sm text-muted-foreground">We'll assign you a local number to forward your calls to.</p>
                <div className="mt-8 border border-border bg-[#0a0a0a] text-[#e5e5e5] rounded-lg p-5 font-mono text-xs min-h-[200px]">
                  {terminalLines.length === 0 && !provisioning && !provisionedNumber && (
                    <div className="text-[#666]">Click "Provision number" to begin…</div>
                  )}
                  {terminalLines.map((l, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={l.startsWith("✓") ? "text-[#73ffb8]" : ""}>
                      {l}
                    </motion.div>
                  ))}
                  {provisioning && <span className="inline-block w-2 h-3 bg-[#e5e5e5] animate-pulse" />}
                </div>
                {provisionedNumber && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 border border-primary/30 bg-primary/5 rounded-lg p-4 flex items-center gap-3">
                    <Phone className="size-4 text-primary" />
                    <div className="font-mono text-lg">{provisionedNumber}</div>
                    <div className="ml-auto text-xs text-muted-foreground">Active</div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-border h-16 px-6 flex items-center justify-between">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground disabled:opacity-30 hover:text-foreground transition"
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>
        <button
          onClick={next}
          disabled={provisioning}
          className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {step === 3 ? (provisionedNumber ? "Finish" : "Provision number") : "Continue"}
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <input placeholder={placeholder} className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-card text-sm outline-none focus:border-primary transition" />
    </div>
  );
}
