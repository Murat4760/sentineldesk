import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/billing")({
  component: Billing,
});

function Billing() {
  const used = 847, total = 2000;
  const pct = used / total;
  const C = 2 * Math.PI * 42;
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Billing</h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-4 mb-6">
        <div className="border border-border bg-card rounded-lg p-6">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Current plan</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">Pro</span>
            <span className="text-muted-foreground">— $499/mo</span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">Renews June 12, 2026</div>
          <div className="mt-6 flex items-center gap-6">
            <div className="relative size-24">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="var(--color-muted)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="42" stroke="var(--color-primary)" strokeWidth="8" fill="none" strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-mono text-lg font-semibold">{Math.round(pct * 100)}%</div>
                <div className="text-[10px] text-muted-foreground">used</div>
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold">{used} <span className="text-muted-foreground text-base">/ {total} min</span></div>
              <div className="text-sm text-muted-foreground">Resets in 15 days</div>
            </div>
          </div>
        </div>
        <div className="border border-border bg-card rounded-lg p-6">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Payment method</div>
          <div className="mt-3 border border-border rounded-lg p-4 bg-gradient-to-br from-foreground to-foreground/80 text-background">
            <CreditCard className="size-5 opacity-60" />
            <div className="mt-6 font-mono tracking-widest">•••• •••• •••• 4242</div>
            <div className="mt-1 flex items-center justify-between text-xs opacity-70">
              <span>Visa</span><span>09/28</span>
            </div>
          </div>
          <button className="mt-3 w-full h-9 border border-border rounded-md text-sm hover:bg-accent transition">Update payment method</button>
        </div>
      </div>

      <div className="text-sm font-medium mb-2">Compare plans</div>
      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {[
          { name: "Starter", price: 199, feats: ["1 number", "500 min/mo", "Email transcripts"] },
          { name: "Pro", price: 499, feats: ["3 numbers", "2000 min/mo", "CRM integrations", "Custom voice"], current: true },
          { name: "Scale", price: 1499, feats: ["Unlimited", "8000 min/mo", "API + webhooks", "SLA"] },
        ].map(p => (
          <div key={p.name} className={`border rounded-lg p-5 ${p.current ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.name}</div>
              {p.current && <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">Current</span>}
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold">${p.price}<span className="text-sm text-muted-foreground font-sans">/mo</span></div>
            <ul className="mt-4 space-y-2">{p.feats.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-3.5 text-primary" /> {f}</li>)}</ul>
          </div>
        ))}
      </div>

      <div className="text-sm font-medium mb-2">Invoices</div>
      <div className="border border-border bg-card rounded-lg overflow-hidden">
        {[
          ["INV-2026-05", "May 12, 2026", "$499.00", "Paid"],
          ["INV-2026-04", "Apr 12, 2026", "$499.00", "Paid"],
          ["INV-2026-03", "Mar 12, 2026", "$499.00", "Paid"],
          ["INV-2026-02", "Feb 12, 2026", "$199.00", "Paid"],
        ].map(([id, date, amt, status]) => (
          <div key={id} className="grid grid-cols-[140px_1fr_120px_80px_60px] gap-3 px-4 py-2.5 border-b border-border last:border-0 items-center text-sm">
            <span className="font-mono text-xs">{id}</span>
            <span className="text-muted-foreground">{date}</span>
            <span className="font-mono">{amt}</span>
            <span className="text-xs text-[color:var(--color-success)]">{status}</span>
            <a className="text-xs text-primary hover:underline cursor-pointer">PDF</a>
          </div>
        ))}
      </div>
    </div>
  );
}
