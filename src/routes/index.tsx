import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import {
  ArrowRight, Check, Play, Clock, Sparkles,
  Phone, Twitter, Github, Linkedin,
} from "lucide-react";
import { LiveWaveform } from "@/components/effects/Waveform";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ringly — Your phone, finally answered." },
      { name: "description", content: "Ringly picks up every call, books appointments, and never sleeps. Sound like you. Available in 30 seconds." },
    ],
  }),
  component: Landing,
});

/* ----------------------- helpers ----------------------- */



function MagneticButton({ children, className = "", as: As = "button", ...props }: any) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={(e) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * 12);
        y.set(((e.clientY - r.top) / r.height - 0.5) * 8);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <As className={className} {...props}>{children}</As>
    </motion.div>
  );
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------- nav ----------------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4">
      <nav className={`nav-pill ${scrolled ? "scrolled" : ""} mx-auto flex items-center justify-between gap-4 pl-3 pr-3 py-2 max-w-[720px]`}>
        <Link to="/" className="group flex items-center gap-2 pl-1">
          <div className="size-7 rounded-lg bg-[#4F7AFF] flex items-center justify-center text-white text-xs font-bold shadow-[0_0_20px_-4px_rgba(79,122,255,0.6)] group-hover:shadow-[0_0_28px_-2px_rgba(79,122,255,0.8)] transition">R</div>
          <span className="font-display text-[15px] font-semibold text-white">Ringly</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 text-[13px] text-white/70">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <Link to="/dashboard" className="hover:text-white transition">Demo</Link>
        </div>
        <Link to="/signup" className="text-[13px] font-medium text-white btn-primary-glow px-3.5 py-1.5 rounded-full">
          Get started
        </Link>
      </nav>
    </div>
  );
}

/* ----------------------- hero demo card ----------------------- */

const transcript = [
  { role: "ai", text: "Hi, thanks for calling Smile Dental — how can I help?" },
  { role: "caller", text: "Hey, I'd like to book a cleaning this week." },
  { role: "ai", text: "Of course. Are you an existing patient?" },
  { role: "caller", text: "Yes, Sarah Johnson." },
  { role: "ai", text: "Found you. I have Thursday 2pm or Friday 9am." },
  { role: "caller", text: "Thursday at 2 works." },
  { role: "ai", text: "Booked — confirmation just sent to your phone." },
];

function DemoCard() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN(v => (v >= transcript.length ? 1 : v + 1)), 1700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative">
      {/* phone card */}
      <div className="card-depth p-4 w-full max-w-[420px] mx-auto">
        <div className="flex items-center gap-3 px-2 py-2 border-b border-white/5">
          <div className="size-9 rounded-full bg-[#4F7AFF]/20 border border-[#4F7AFF]/30 flex items-center justify-center text-white text-sm font-semibold">SJ</div>
          <div>
            <div className="text-[13px] font-medium text-white">Sarah J. <span className="text-white/40 font-normal">· example</span></div>
            <div className="text-[11px] text-white/50 font-mono">Incoming call · {String(n * 4).padStart(2, "0")}s</div>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Demo conversation</span>
          </div>
        </div>

        <div className="py-4 px-1 space-y-2.5 min-h-[260px]">
          {transcript.slice(0, n).map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`flex ${l.role === "caller" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[82%] px-3 py-2 rounded-xl text-[13px] leading-snug ${
                l.role === "caller"
                  ? "bg-white/10 text-white border border-white/10"
                  : "bg-gradient-to-br from-[#4F7AFF] to-[#4A6FEE] text-white shadow-[0_8px_24px_-12px_rgba(79,122,255,0.7)]"
              }`}>
                {l.text}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 px-2 py-2 border-t border-white/5">
          <Phone className="size-3.5 text-white/40" />
          <LiveWaveform bars={28} className="h-5 flex-1" />
          <span className="font-mono text-[11px] text-white/40">+1 415 555-0142</span>
        </div>
      </div>

      {/* floating: try a demo call */}
      <motion.div
        initial={{ opacity: 0, y: 12, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute -bottom-6 -right-2 sm:-right-6 card-depth px-3.5 py-3 flex items-center gap-2.5 w-[230px]"
      >
        <div className="size-7 rounded-md bg-[#4F7AFF]/15 border border-[#4F7AFF]/30 flex items-center justify-center">
          <Phone className="size-3.5 text-[#4F7AFF]" />
        </div>
        <div>
          <div className="text-[12px] font-medium text-white">Try a demo call</div>
          <div className="text-[11px] text-white/50 font-mono">Hear it yourself</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ----------------------- bento features ----------------------- */

function BentoCards() {
  const langs = ["🇺🇸","🇬🇧","🇪🇸","🇫🇷","🇩🇪","🇮🇹","🇵🇹","🇳🇱","🇸🇪","🇩🇰","🇯🇵","🇰🇷","🇨🇳","🇮🇳","🇹🇷","🇵🇱","🇨🇿","🇬🇷","🇮🇱","🇸🇦","🇧🇷","🇲🇽","🇦🇷","🇻🇳","🇹🇭","🇮🇩","🇲🇾","🇺🇦","🇳🇴","🇫🇮"];
  const cal = Array.from({ length: 35 }, (_, i) => i);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Wide: voice */}
      <Reveal>
        <div className="bento card-depth md:col-span-2 p-6 md:p-7 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Voice</div>
          <h3 className="mt-2 font-display text-2xl text-white">Sounds like a real human.</h3>
          <p className="mt-2 text-sm text-white/60 max-w-md">30+ natural voices with breaths, pauses, and personality. Clone your own in 60 seconds.</p>
          <div className="mt-6 flex items-end gap-[3px] h-20">
            {Array.from({ length: 64 }).map((_, i) => {
              const h = Math.abs(Math.sin(i * 0.4) * 0.5 + Math.sin(i * 0.13) * 0.4) + 0.15;
              return <span key={i} className="flex-1 rounded-full bg-gradient-to-t from-[#4F7AFF]/40 to-[#4F7AFF]/70" style={{ height: `${Math.min(1, h) * 100}%` }} />;
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {["Sophia","Marcus","Aria","David","Luna","Ren"].map((v, i) => (
              <span key={v} className={`text-[11px] px-2.5 py-1 rounded-full border ${i === 0 ? "bg-[#4F7AFF]/15 border-[#4F7AFF]/40 text-white" : "border-white/10 text-white/60"}`}>{v}</span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Calendar */}
      <Reveal delay={0.05}>
        <div className="bento card-depth p-6 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Calendar</div>
          <h3 className="mt-2 font-display text-xl text-white">Books appointments.</h3>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {cal.map(d => {
              const day = d - 2;
              const valid = day > 0 && day <= 30;
              const booked = [4, 8, 11, 17, 22, 25].includes(day);
              const today = day === 14;
              return (
                <div key={d} className={`aspect-square rounded-md text-[10px] font-mono flex items-center justify-center ${
                  !valid ? "text-white/10" :
                  today ? "bg-[#4F7AFF] text-white shadow-[0_0_16px_-2px_rgba(79,122,255,0.7)]" :
                  booked ? "bg-[#4F7AFF]/15 text-[#6B8FFF] border border-[#4F7AFF]/30" :
                  "text-white/40 hover:bg-white/5"
                }`}>{valid ? day : ""}</div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Languages */}
      <Reveal>
        <div className="bento card-depth p-6 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Languages</div>
          <h3 className="mt-2 font-display text-xl text-white">Speaks 30 languages.</h3>
          <div className="mt-4 grid grid-cols-6 gap-1.5">
            {langs.map((f, i) => (
              <div key={i} className="aspect-square rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center text-base">{f}</div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Wide: knowledge */}
      <Reveal delay={0.05}>
        <div className="bento card-depth md:col-span-2 p-6 md:p-7 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Knowledge</div>
          <h3 className="mt-2 font-display text-2xl text-white">Knows your business.</h3>
          <p className="mt-2 text-sm text-white/60 max-w-md">Upload menus, FAQs, pricing. Ringly answers like a senior team member from day one.</p>
          <div className="mt-5 rounded-lg border border-white/10 bg-[#0A0B0F] font-mono text-[12px] overflow-hidden">
            <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#F87171]/70" />
              <span className="size-2 rounded-full bg-[#FBBF24]/70" />
              <span className="size-2 rounded-full bg-[#4ADE80]/70" />
              <span className="ml-2 text-white/40 text-[10px]">system.prompt</span>
            </div>
            <div className="px-4 py-3 leading-relaxed">
              <span className="text-white/40">{"// persona"}</span><br/>
              <span className="text-[#4F7AFF]">name</span> <span className="text-white/50">=</span> <span className="text-[#4ADE80]">"Ringly · Smile Dental"</span><br/>
              <span className="text-[#4F7AFF]">tone</span> <span className="text-white/50">=</span> <span className="text-[#4ADE80]">"warm, concise, never pushy"</span><br/>
              <span className="text-[#4F7AFF]">escalate_if</span> <span className="text-white/50">=</span> <span className="text-[#4F7AFF]">[</span>"emergency", "billing dispute"<span className="text-[#4F7AFF]">]</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Clock */}
      <Reveal>
        <div className="bento card-depth p-6 h-full flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Always on</div>
          <h3 className="mt-2 font-display text-xl text-white">24 / 7.</h3>
          <div className="mt-auto pt-4 flex items-center justify-center">
            <div className="relative size-32">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-2 rounded-full border border-white/5" />
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="absolute left-1/2 top-1/2 w-px h-2 bg-white/20" style={{ transform: `translate(-50%,-50%) rotate(${i * 30}deg) translateY(-58px)` }} />
              ))}
              <Clock className="absolute inset-0 m-auto size-6 text-[#4F7AFF]" />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 60px -10px rgba(79,122,255,0.5)" }} />
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ----------------------- pricing ----------------------- */

function Pricing() {
  const [yearly, setYearly] = useState(false);
  const tiers = [
    { name: "Starter", price: 199, minutes: 500, feats: ["1 phone number", "Email transcripts", "Calendar sync", "Basic voices"] },
    { name: "Pro", price: 499, minutes: 2000, feats: ["3 phone numbers", "CRM integrations", "Custom voice clone", "Priority support", "Workflow automations"], popular: true },
    { name: "Scale", price: 1499, minutes: 8000, feats: ["Unlimited numbers", "API + webhooks", "Dedicated success manager", "99.99% SLA", "SSO + audit logs"] },
  ];
  return (
    <div>
      <div className="flex items-center justify-center mb-10">
        <div className="relative flex items-center p-1 rounded-full border border-white/10 bg-white/[0.03]">
          <motion.div
            layout transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute top-1 bottom-1 w-[88px] rounded-full btn-primary-glow"
            style={{ left: yearly ? 92 : 4 }}
          />
          <button onClick={() => setYearly(false)} className={`relative z-10 w-[88px] py-1.5 text-[13px] font-medium ${!yearly ? "text-white" : "text-white/60"}`}>Monthly</button>
          <button onClick={() => setYearly(true)} className={`relative z-10 w-[88px] py-1.5 text-[13px] font-medium ${yearly ? "text-white" : "text-white/60"}`}>Yearly</button>
        </div>
        <span className="ml-3 text-[11px] font-mono text-[#4ADE80]">save 20%</span>
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
        {tiers.map(t => {
          const price = yearly ? Math.round(t.price * 0.8) : t.price;
          const Wrap = t.popular ? "div" : "div";
          return (
            <Wrap
              key={t.name}
              className={`relative ${t.popular ? "gradient-border md:scale-[1.04] md:-my-2 shadow-[0_0_60px_-15px_rgba(79,122,255,0.5)]" : "card-depth"} p-7 flex flex-col`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r from-[#4F7AFF] to-[#4F7AFF] text-white shadow-[0_0_20px_-2px_rgba(79,122,255,0.7)]">
                  Most popular
                </div>
              )}
              <div className="text-sm font-medium text-white/80">{t.name}</div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-white">${price}</span>
                <span className="text-sm text-white/50">/mo</span>
              </div>
              <div className="mt-1 text-[12px] font-mono text-white/40">{t.minutes.toLocaleString()} minutes included</div>
              <ul className="mt-6 space-y-3 flex-1">
                {t.feats.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/75">
                    <div className="mt-0.5 size-4 shrink-0 rounded-full bg-[#4F7AFF]/15 border border-[#4F7AFF]/30 flex items-center justify-center">
                      <Check className="size-2.5 text-[#6B8FFF]" strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`mt-7 text-center text-sm font-medium py-2.5 rounded-lg transition ${
                  t.popular ? "btn-primary-glow" : "btn-secondary-dark"
                }`}
              >
                Get {t.name}
              </Link>
            </Wrap>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- page ----------------------- */

function Landing() {
  const heroRef = useRef<HTMLElement | null>(null);
  const onMove = (e: MouseEvent) => {
    const el = heroRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div className="dark min-h-screen bg-[#0A0B0F] text-white antialiased">
      <Nav />

      {/* ===== HERO ===== */}
      <section ref={heroRef} onMouseMove={onMove} className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="absolute inset-0 bg-grid-brand [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="orb orb-blue" style={{ width: 720, height: 720, bottom: -300, right: -200 }} />
        <div className="spotlight" />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          {/* left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-[11px] font-mono px-2.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/70"
            >
              <span className="size-1.5 rounded-full bg-[#4F7AFF] dot-pulse" />
              Now in early access
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display font-semibold text-[#F5F5F7] mt-6"
              style={{ fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 1.02, letterSpacing: "-0.03em" }}
            >
              Your phone,<br/>
              finally answered.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-[17px] text-white/60 max-w-xl leading-relaxed"
            >
              Ringly picks up every call, books appointments, and never sleeps. Sound like you. Available in 30 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <MagneticButton
                as={Link}
                to="/signup"
                className="group inline-flex items-center gap-2 btn-primary-glow px-5 py-3 rounded-lg text-[14px] font-medium"
              >
                Start free trial <ArrowRight className="cta-arrow size-4" />
              </MagneticButton>
              <MagneticButton
                as={Link}
                to="/dashboard"
                className="inline-flex items-center gap-2 btn-secondary-dark px-5 py-3 rounded-lg text-[14px] font-medium"
              >
                <Play className="size-3.5 fill-current" /> Hear a demo call
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/55"
            >
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#4F7AFF]" /> Setup in 5 minutes</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#4F7AFF]" /> No credit card required</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#4F7AFF]" /> Cancel anytime</span>
            </motion.div>
          </div>

          {/* right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <DemoCard />
          </motion.div>
        </div>
      </section>




      {/* ===== FEATURES BENTO ===== */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-brand opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Features</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-white tracking-tight" style={{ letterSpacing: "-0.025em" }}>
                Everything a great receptionist does.<br/>
                <span className="text-white/50">None of the sick days.</span>
              </h2>
            </div>
          </Reveal>
          <div className="mt-14">
            <BentoCards />
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative py-24 md:py-32 border-t border-white/5">
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -100, left: "30%", opacity: 0.5 }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-10">
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Pricing</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-white" style={{ letterSpacing: "-0.025em" }}>
                Pay for minutes, not seats.
              </h2>
              <p className="mt-3 text-white/60">Start in 5 minutes. Cancel anytime.</p>
            </div>
          </Reveal>
          <Reveal delay={0.05}><Pricing /></Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 border-t border-white/5">
        <div className="orb orb-blue" style={{ width: 520, height: 360, bottom: -180, left: "50%", transform: "translateX(-50%)", opacity: 0.6 }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Sparkles className="size-6 text-[#4F7AFF] mx-auto" />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-white" style={{ letterSpacing: "-0.025em" }}>
            Ready in 30 seconds.
          </h2>
          <p className="mt-3 text-white/60">No credit card. Bring your number or pick a new one.</p>
          <div className="mt-8 flex justify-center gap-3">
            <MagneticButton as={Link} to="/signup" className="group inline-flex items-center gap-2 btn-primary-glow px-6 py-3 rounded-lg text-sm font-medium">
              Start free trial <ArrowRight className="cta-arrow size-4" />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative border-t border-white/5 bg-[#08090D]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <div className="font-display text-4xl font-semibold text-white">Ringly</div>
              <p className="mt-3 text-sm text-white/50 max-w-xs">The AI receptionist that picks up every call, books every appointment, and never takes a break.</p>
              <form className="mt-6 flex max-w-sm" onSubmit={e => e.preventDefault()}>
                <input
                  type="email" placeholder="you@company.com"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-l-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#4F7AFF]/50"
                />
                <button className="btn-primary-glow px-4 rounded-r-lg text-sm font-medium">Subscribe</button>
              </form>
            </div>

            {[
              { title: "Product", links: ["Features","Pricing","Changelog","Roadmap"] },
              { title: "Company", links: ["About","Customers","Careers","Contact"] },
              { title: "Resources", links: ["Docs","API","Guides","Support"] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-[11px] uppercase tracking-widest font-mono text-white/40">{col.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[12px] font-mono text-white/50">
              <span className="size-1.5 rounded-full bg-[#4ADE80] dot-pulse" />
              All systems operational
            </div>
            <div className="text-[12px] text-white/40">© 2026 Ringly Labs, Inc.</div>
            <div className="flex items-center gap-3 text-white/40">
              <a href="#" className="hover:text-white transition"><Twitter className="size-4" /></a>
              <a href="#" className="hover:text-white transition"><Github className="size-4" /></a>
              <a href="#" className="hover:text-white transition"><Linkedin className="size-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
