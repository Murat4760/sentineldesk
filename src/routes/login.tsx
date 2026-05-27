import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LiveWaveform } from "@/components/effects/Waveform";
import { Mail, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return <AuthLayout title="Welcome back" sub="Sign in to your Ringly dashboard" cta="Sign in" alt={["No account?", "Create one", "/signup"]} />;
}

export function AuthLayout({ title, sub, cta, alt }: { title: string; sub: string; cta: string; alt: [string, string, string] }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="flex flex-col p-8 md:p-12">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="size-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">R</div>
          Ringly
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="m-auto w-full max-w-sm"
        >
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = "/dashboard"; }}>
            <div>
              <label className="text-xs font-medium">Email</label>
              <input type="email" required defaultValue="" placeholder="you@company.com" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition" />
            </div>
            <div>
              <label className="text-xs font-medium">Password</label>
              <input type="password" required placeholder="••••••••" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition" />
            </div>
            <button type="submit" className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-1.5">
              {cta} <ArrowRight className="size-3.5" />
            </button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 border-t border-border" /> or <div className="flex-1 border-t border-border" />
          </div>
          <div className="space-y-2">
            <button className="w-full h-10 rounded-md border border-border bg-card text-sm hover:border-foreground/20 transition inline-flex items-center justify-center gap-2">
              <Mail className="size-4" /> Continue with magic link
            </button>
            <button className="w-full h-10 rounded-md border border-border bg-card text-sm hover:border-foreground/20 transition inline-flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/></svg>
              Continue with Google
            </button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground text-center">
            {alt[0]} <Link to={alt[2]} className="text-foreground font-medium hover:underline">{alt[1]}</Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden md:flex relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative m-auto max-w-md p-12 text-left">
          <div className="border border-background/20 rounded-xl p-5 bg-background/5 backdrop-blur">
            <div className="flex items-center gap-2 text-xs">
              <span className="size-1.5 rounded-full bg-[color:var(--color-success)] pulse-ring" />
              Live call
              <span className="ml-auto font-mono opacity-60">00:42</span>
            </div>
            <LiveWaveform bars={40} className="mt-4 h-12" />
            <div className="mt-4 text-sm opacity-80">"…we have an opening Friday at 9am or Monday at 11am — which works better?"</div>
          </div>
          <blockquote className="mt-10 text-xl font-medium leading-snug tracking-tight">
            "We booked 38% more appointments in the first month. It pays for itself in a week."
          </blockquote>
          <div className="mt-4 text-sm opacity-60">— Marcus Webb, Owner · Webb Plumbing</div>
        </div>
      </div>
    </div>
  );
}
