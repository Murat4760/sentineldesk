import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, PhoneCall, Sparkles, Zap, Shield } from "lucide-react";
import { LiveWaveform } from "@/components/effects/Waveform";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ringly — AI receptionist that never misses a call" },
      { name: "description", content: "Ringly is the AI phone receptionist for small businesses. Book appointments, answer questions, and capture leads 24/7." },
    ],
  }),
  component: Landing,
});

const demoLines = [
  { role: "ai", text: "Hi, thanks for calling Smile Dental. How can I help?" },
  { role: "caller", text: "I need to book a cleaning." },
  { role: "ai", text: "Of course. Are you a current patient?" },
  { role: "caller", text: "Yes, Sarah Johnson." },
  { role: "ai", text: "Found you. Friday 9am or Monday 11am?" },
  { role: "caller", text: "Friday works." },
  { role: "ai", text: "Booked. Confirmation sent." },
];

function Landing() {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const i = setInterval(() => setShown(s => (s >= demoLines.length ? 1 : s + 1)), 1800);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="size-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">R</div>
            Ringly
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="#" className="hover:text-foreground transition">Docs</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">Log in</Link>
            <Link to="/signup" className="text-sm bg-foreground text-background px-3 py-1.5 rounded-md hover:opacity-90 transition">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 border border-border rounded-full bg-card mb-6"
          >
            <Sparkles className="size-3 text-primary" />
            New — book appointments end to end
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
            className="text-5xl md:text-6xl font-semibold tracking-tight max-w-3xl mx-auto"
          >
            The AI receptionist that <span className="text-primary">never misses a call</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Answer every call in seconds. Book appointments, qualify leads, and capture details — 24/7.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Link to="/signup" className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition">
              Start free trial <ArrowRight className="size-3.5" />
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 border border-border bg-card px-4 py-2.5 rounded-md text-sm font-medium hover:border-foreground/20 transition">
              View demo
            </Link>
          </motion.div>

          {/* Live demo widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-16 max-w-2xl mx-auto border border-border rounded-xl bg-card shadow-sm overflow-hidden text-left"
          >
            <div className="h-10 px-4 border-b border-border flex items-center gap-2 bg-muted/30">
              <span className="size-2 rounded-full bg-[color:var(--color-success)] pulse-ring" />
              <span className="text-xs font-medium">Live call · 00:{String(shown * 5).padStart(2, "0")}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">+1 (415) 555-0142</span>
              <LiveWaveform bars={12} className="h-4" />
            </div>
            <div className="p-5 space-y-3 min-h-[280px]">
              {demoLines.slice(0, shown).map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={`flex ${l.role === "caller" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${l.role === "caller" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {l.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
            {[
              { icon: PhoneCall, title: "Answer instantly", desc: "Pick up every call within 1 ring. No hold music. No voicemails missed." },
              { icon: Zap, title: "Book in real time", desc: "Connects to your calendar and books while the caller is still on the line." },
              { icon: Shield, title: "Sounds like you", desc: "Choose from 30+ natural voices. Add your brand greeting and FAQ." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-background p-8"
              >
                <f.icon className="size-5 text-primary" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">Simple pricing</h2>
            <p className="mt-2 text-muted-foreground">Start in 5 minutes. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Starter", price: 199, minutes: 500, feats: ["1 phone number", "Email transcripts", "Calendar sync"] },
              { name: "Pro", price: 499, minutes: 2000, feats: ["3 phone numbers", "CRM integrations", "Custom voice", "Priority support"], popular: true },
              { name: "Scale", price: 1499, minutes: 8000, feats: ["Unlimited numbers", "API + webhooks", "Dedicated success", "SLA"] },
            ].map(p => (
              <div key={p.name} className={`relative p-6 rounded-xl bg-card border ${p.popular ? "border-primary" : "border-border"}`}>
                {p.popular && <div className="absolute -top-2 left-6 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded">Most popular</div>}
                <div className="text-sm font-medium">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-semibold">${p.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground font-mono">{p.minutes} minutes included</div>
                <ul className="mt-6 space-y-2.5">
                  {p.feats.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-3.5 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`mt-6 block text-center text-sm font-medium py-2 rounded-md transition ${p.popular ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-border hover:border-foreground/20"}`}>
                  Get {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-primary" />
            <span>Ringly © 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
