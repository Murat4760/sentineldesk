import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Play, Pause, Clock, Sparkles, Phone, X,
  Twitter, Github, Linkedin, ShieldCheck, MapPin, Languages, Wrench,
} from "lucide-react";
import { LiveWaveform } from "@/components/effects/Waveform";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel — Telefonunuz artık her zaman açık." },
      { name: "description", content: "Sentinel her aramaya cevap verir, randevu alır, asla uyumaz. Sizin gibi konuşur. 5 dakikada kurulur." },
    ],
  }),
  component: Landing,
});

/* ----------------------- helpers ----------------------- */

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

/* ----------------------- speech util (client only) ----------------------- */

function speak(text: string, opts: { rate?: number; pitch?: number; voiceIdx?: number } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "tr-TR";
  u.rate = opts.rate ?? 0.98;
  u.pitch = opts.pitch ?? 1;
  const voices = window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith("tr"));
  if (voices.length > 0) u.voice = voices[(opts.voiceIdx ?? 0) % voices.length];
  window.speechSynthesis.speak(u);
  return u;
}

function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

/* ----------------------- nav ----------------------- */

function Nav({ onTrial }: { onTrial: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4">
      <nav className={`nav-pill ${scrolled ? "scrolled" : ""} mx-auto flex items-center justify-between gap-4 pl-3 pr-3 py-2 max-w-[760px]`}>
        <Link to="/" className="group flex items-center gap-2 pl-1">
          <div className="size-7 rounded-lg bg-[#4F7AFF] flex items-center justify-center text-white text-xs font-bold shadow-[0_0_20px_-4px_rgba(79,122,255,0.6)]">R</div>
          <span className="font-display text-[15px] font-semibold text-white">Sentinel</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 text-[13px] text-white/70">
          <a href="#features" className="hover:text-white transition">Özellikler</a>
          <a href="#demo" className="hover:text-white transition">Demo</a>
          <a href="#pricing" className="hover:text-white transition">Fiyatlar</a>
          <Link to="/login" className="hover:text-white transition">Giriş Yap</Link>
        </div>
        <button onClick={onTrial} className="text-[13px] font-medium text-white btn-primary-glow px-3.5 py-1.5 rounded-full">
          Hemen Başla
        </button>
      </nav>
    </div>
  );
}

/* ----------------------- hero demo card ----------------------- */

const heroTranscript = [
  { role: "ai", text: "Merhaba, Beyaz Diş Polikliniği'ne hoş geldiniz. Size nasıl yardımcı olabilirim?" },
  { role: "caller", text: "Merhaba, diş temizliği için randevu almak istiyorum." },
  { role: "ai", text: "Tabii ki, daha önce kliniğimize geldiniz mi?" },
  { role: "caller", text: "Hayır, ilk defa arıyorum." },
  { role: "ai", text: "Anladım. Hangi gün sizin için uygun olur?" },
  { role: "caller", text: "Perşembe öğleden sonra olabilir mi?" },
  { role: "ai", text: "Perşembe 15:00 müsait. Onaylıyor musunuz?" },
  { role: "caller", text: "Evet, harika." },
];

function DemoCard() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN(v => (v >= heroTranscript.length ? 1 : v + 1)), 1900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative">
      <div className="card-depth p-4 w-full max-w-[420px] mx-auto">
        <div className="flex items-center gap-3 px-2 py-2 border-b border-white/5">
          <div className="size-9 rounded-full bg-[#4F7AFF]/20 border border-[#4F7AFF]/30 flex items-center justify-center text-white text-sm font-semibold">AY</div>
          <div>
            <div className="text-[13px] font-medium text-white">Ayşe Y. <span className="text-white/40 font-normal">· örnek</span></div>
            <div className="text-[11px] text-white/50 font-mono">Gelen arama · {String(n * 4).padStart(2, "0")}s</div>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Demo</span>
          </div>
        </div>

        <div className="py-4 px-1 space-y-2.5 min-h-[280px]">
          {heroTranscript.slice(0, n).map((l, i) => (
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
          <span className="font-mono text-[11px] text-white/40">+90 532 555 0142</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- voice picker (interactive) ----------------------- */

const VOICES = [
  { id: "zeynep", name: "Zeynep", traits: ["Sıcak", "Profesyonel"], voiceIdx: 0, pitch: 1.05 },
  { id: "mehmet", name: "Mehmet", traits: ["Güvenli", "Samimi"], voiceIdx: 1, pitch: 0.9 },
  { id: "elif", name: "Elif", traits: ["Genç", "Enerjik"], voiceIdx: 2, pitch: 1.15 },
  { id: "can", name: "Can", traits: ["Sakin", "Dengeli"], voiceIdx: 3, pitch: 0.95 },
  { id: "selin", name: "Selin", traits: ["Kibar", "Kurumsal"], voiceIdx: 4, pitch: 1.0 },
];

function VoicePicker() {
  const [selected, setSelected] = useState("zeynep");
  const [playing, setPlaying] = useState<string | null>(null);

  const handlePick = (v: typeof VOICES[number]) => {
    setSelected(v.id);
    // Toggle: clicking the currently playing voice stops it.
    if (playing === v.id) {
      stopSpeech();
      setPlaying(null);
      return;
    }
    // speak() cancels any in-flight utterance, guaranteeing one at a time.
    const u = speak(`Merhaba, ben ${v.name}. Size nasıl yardımcı olabilirim?`, {
      voiceIdx: v.voiceIdx, pitch: v.pitch, rate: 0.95,
    });
    setPlaying(v.id);
    if (u) {
      u.onend = () => setPlaying(p => (p === v.id ? null : p));
      u.onerror = () => setPlaying(p => (p === v.id ? null : p));
    }
  };

  useEffect(() => () => stopSpeech(), []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {VOICES.map(v => {
        const isSel = selected === v.id;
        const isPlaying = playing === v.id;
        return (
          <div
            key={v.id}
            role="button"
            tabIndex={0}
            onClick={() => handlePick(v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePick(v);
              }
            }}
            aria-pressed={isSel}
            aria-label={`${v.name} sesini ${isPlaying ? "durdur" : "dinle"}`}
            className={`group text-left card-depth p-4 transition cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#4F7AFF]/60 ${isSel ? "ring-1 ring-[#4F7AFF]/60 shadow-[0_0_30px_-10px_rgba(79,122,255,0.6)]" : "hover:border-white/20"}`}
          >
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-full bg-[#4F7AFF]/15 border border-[#4F7AFF]/30 flex items-center justify-center text-white text-sm font-semibold">
                {v.name[0]}
              </div>
              <span
                className={`size-8 rounded-full flex items-center justify-center transition ${isPlaying ? "bg-[#4F7AFF] text-white" : "bg-white/5 group-hover:bg-white/10 text-white/70"}`}
                aria-hidden="true"
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
              </span>
            </div>
            <div className="mt-3 text-[14px] font-medium text-white">{v.name}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {v.traits.map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-white/60">{t}</span>
              ))}
            </div>
            <div className="mt-3 h-4 flex items-end gap-[2px]">
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className={`flex-1 rounded-full ${isPlaying ? "bg-[#4F7AFF]" : isSel ? "bg-[#4F7AFF]/40" : "bg-white/10"}`}
                  style={{
                    height: `${isPlaying ? 30 + Math.abs(Math.sin(i * 0.6 + Date.now() / 200)) * 70 : 30 + Math.abs(Math.sin(i * 0.5)) * 60}%`,
                    transition: "height 120ms ease",
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>

  );
}

/* ----------------------- "Canlı Deneyin" interactive demos ----------------------- */

const SECTOR_DEMOS = [
  {
    id: "dental", label: "Diş Hekimi", business: "Beyaz Diş Polikliniği",
    lines: [
      { role: "ai", text: "Merhaba, Beyaz Diş Polikliniği. Nasıl yardımcı olabilirim?" },
      { role: "caller", text: "Diş temizliği için randevu istiyorum." },
      { role: "ai", text: "Tabii. Perşembe 14:00 veya 16:00 müsait." },
      { role: "caller", text: "15:00 olur." },
      { role: "ai", text: "Ayşe Hanım, randevunuz Perşembe 15:00 için onaylandı." },
    ],
  },
  {
    id: "hvac", label: "Klima Servis", business: "Anadolu Klima Servis",
    lines: [
      { role: "ai", text: "Anadolu Klima Servis, hoş geldiniz." },
      { role: "caller", text: "Klimam soğutmuyor, acil bakım lazım." },
      { role: "ai", text: "Bugün 14:00-17:00 arası teknisyen gönderebiliriz." },
      { role: "caller", text: "Harika, adresim Beylikdüzü." },
      { role: "ai", text: "Onaylandı. Servis ücreti 450 TL, SMS göndereceğim." },
    ],
  },
  {
    id: "vet", label: "Veteriner", business: "Patiland Veteriner",
    lines: [
      { role: "ai", text: "Patiland Veteriner, merhaba." },
      { role: "caller", text: "Kedim için aşı randevusu almak istiyorum." },
      { role: "ai", text: "Yarın 11:00 ve 15:30 uygun. Hangisi olsun?" },
      { role: "caller", text: "11:00 mükemmel." },
      { role: "ai", text: "Tamamdır, randevu kaydedildi." },
    ],
  },
  {
    id: "restaurant", label: "Restoran", business: "Lezzet Börek",
    lines: [
      { role: "ai", text: "Lezzet Börek, iyi günler!" },
      { role: "caller", text: "4 kişilik rezervasyon yapabilir miyim, akşam 19:30?" },
      { role: "ai", text: "Tabii ki. İsim ve telefon alabilir miyim?" },
      { role: "caller", text: "Murat Çelik, 0535 555 0319." },
      { role: "ai", text: "Teşekkürler, 19:30 için masanız hazır olacak." },
    ],
  },
];

function LiveDemo() {
  const [tab, setTab] = useState(SECTOR_DEMOS[0].id);
  const [playing, setPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const current = SECTOR_DEMOS.find(s => s.id === tab)!;

  useEffect(() => { stopSpeech(); setPlaying(false); setActiveLine(-1); }, [tab]);
  useEffect(() => () => stopSpeech(), []);

  const playAll = async () => {
    if (playing) { stopSpeech(); setPlaying(false); setActiveLine(-1); return; }
    setPlaying(true);
    for (let i = 0; i < current.lines.length; i++) {
      setActiveLine(i);
      await new Promise<void>((resolve) => {
        const u = speak(current.lines[i].text, {
          voiceIdx: current.lines[i].role === "ai" ? 0 : 1,
          pitch: current.lines[i].role === "ai" ? 1.05 : 0.95,
          rate: 1,
        });
        if (!u) { setTimeout(resolve, 1200); return; }
        u.onend = () => resolve();
        u.onerror = () => resolve();
      });
    }
    setPlaying(false);
    setActiveLine(-1);
  };

  return (
    <div className="card-depth p-6 md:p-8">
      <div className="flex flex-wrap gap-2 mb-6">
        {SECTOR_DEMOS.map(s => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition ${
              tab === s.id
                ? "bg-[#4F7AFF] text-white border-[#4F7AFF]"
                : "border-white/10 text-white/70 hover:text-white hover:border-white/20"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={playAll}
          className="size-14 rounded-full bg-[#4F7AFF] text-white flex items-center justify-center shadow-[0_0_30px_-6px_rgba(79,122,255,0.7)] hover:scale-105 transition"
          aria-label={playing ? "Durdur" : "Oynat"}
        >
          {playing ? <Pause className="size-6" /> : <Play className="size-6 ml-1" />}
        </button>
        <div>
          <div className="text-[15px] font-medium text-white">{current.business}</div>
          <div className="text-[12px] text-white/50 font-mono">Sentinel demo · Türkçe</div>
        </div>
        {playing && <LiveWaveform bars={20} className="ml-auto h-6" />}
      </div>

      <div className="space-y-2.5 border-t border-white/5 pt-5">
        {current.lines.map((l, i) => (
          <div
            key={i}
            className={`flex ${l.role === "caller" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-[13.5px] leading-snug transition-all duration-300 ${
              activeLine === i ? "scale-[1.02] ring-1 ring-[#4F7AFF]/60" : "opacity-70"
            } ${
              l.role === "caller"
                ? "bg-white/10 text-white border border-white/10"
                : "bg-gradient-to-br from-[#4F7AFF] to-[#4A6FEE] text-white"
            }`}>
              {l.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-[11px] font-mono text-white/40">
        Bu konuşma bir Sentinel demosudur. Ses, tarayıcı sentezi ile oynatılır.
      </div>
    </div>
  );
}

/* ----------------------- bento features ----------------------- */

function BentoCards() {
  const cal = Array.from({ length: 35 }, (_, i) => i);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Reveal>
        <div className="bento card-depth md:col-span-2 p-6 md:p-7 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Ses</div>
          <h3 className="mt-2 font-display text-2xl text-white">Gerçek insan gibi konuşur.</h3>
          <p className="mt-2 text-sm text-white/60 max-w-md">Türkçe için optimize edilmiş doğal sesler. Nefes alır, durur, duygu katar.</p>
          <div className="mt-6 flex items-end gap-[3px] h-20">
            {Array.from({ length: 64 }).map((_, i) => {
              const h = Math.abs(Math.sin(i * 0.4) * 0.5 + Math.sin(i * 0.13) * 0.4) + 0.15;
              return <span key={i} className="flex-1 rounded-full bg-gradient-to-t from-[#4F7AFF]/40 to-[#4F7AFF]/70" style={{ height: `${Math.min(1, h) * 100}%` }} />;
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="bento card-depth p-6 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Takvim</div>
          <h3 className="mt-2 font-display text-xl text-white">Randevuyu kendisi alır.</h3>
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
                  "text-white/40"
                }`}>{valid ? day : ""}</div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="bento card-depth p-6 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Bilgi</div>
          <h3 className="mt-2 font-display text-xl text-white">İşinizi öğrenir.</h3>
          <p className="mt-3 text-sm text-white/60">Menünüzü, fiyatlarınızı, SSS'lerinizi yükleyin. Sentinel ilk günden ekibinizdenmiş gibi cevap verir.</p>
          <div className="mt-4 space-y-1.5">
            {["Fiyat listesi", "Çalışma saatleri", "Hizmet kataloğu"].map(s => (
              <div key={s} className="flex items-center gap-2 text-[12px] text-white/70">
                <Check className="size-3 text-[#4F7AFF]" /> {s}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="bento card-depth md:col-span-2 p-6 md:p-7 h-full">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Sistem komutu</div>
          <h3 className="mt-2 font-display text-2xl text-white">Sizin gibi konuşur.</h3>
          <p className="mt-2 text-sm text-white/60 max-w-md">Karakterini, tonunu, kurallarını siz belirlersiniz. Her arama markanız gibi.</p>
          <div className="mt-5 rounded-lg border border-white/10 bg-[#0A0B0F] font-mono text-[12px] overflow-hidden">
            <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#F87171]/70" />
              <span className="size-2 rounded-full bg-[#FBBF24]/70" />
              <span className="size-2 rounded-full bg-[#4ADE80]/70" />
              <span className="ml-2 text-white/40 text-[10px]">sistem.komut</span>
            </div>
            <div className="px-4 py-3 leading-relaxed">
              <span className="text-white/40">{"// karakter"}</span><br/>
              <span className="text-[#4F7AFF]">isim</span> <span className="text-white/50">=</span> <span className="text-[#4ADE80]">"Zeynep · Beyaz Diş"</span><br/>
              <span className="text-[#4F7AFF]">ton</span> <span className="text-white/50">=</span> <span className="text-[#4ADE80]">"sıcak, kısa, asla zorlamaz"</span><br/>
              <span className="text-[#4F7AFF]">aktar_eger</span> <span className="text-white/50">=</span> <span className="text-[#4F7AFF]">[</span>"acil", "şikayet"<span className="text-[#4F7AFF]">]</span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="bento card-depth p-6 h-full flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-[#4F7AFF] font-mono">Her zaman açık</div>
          <h3 className="mt-2 font-display text-xl text-white">7 / 24.</h3>
          <div className="mt-auto pt-4 flex items-center justify-center">
            <div className="relative size-32">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-2 rounded-full border border-white/5" />
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="absolute left-1/2 top-1/2 w-px h-2 bg-white/20" style={{ transform: `translate(-50%,-50%) rotate(${i * 30}deg) translateY(-58px)` }} />
              ))}
              <Clock className="absolute inset-0 m-auto size-6 text-[#4F7AFF]" />
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
    { name: "Başlangıç", price: 2999, minutes: 500, feats: ["1 telefon numarası", "E-posta transkript", "Takvim entegrasyonu", "Türkçe sesler"] },
    { name: "Profesyonel", price: 6999, minutes: 2000, feats: ["3 telefon numarası", "CRM entegrasyonları", "Kişisel ses klonu", "Öncelikli destek", "İş akışı otomasyonu"], popular: true },
    { name: "Kurumsal", price: 17999, minutes: 8000, feats: ["Sınırsız numara", "API + webhook'lar", "Özel müşteri yöneticisi", "%99.99 SLA", "SSO + denetim kayıtları"] },
  ];
  const fmt = (n: number) => "₺" + n.toLocaleString("tr-TR");
  return (
    <div>
      <div className="flex items-center justify-center mb-10">
        <div className="relative flex items-center p-1 rounded-full border border-white/10 bg-white/[0.03]">
          <motion.div
            layout transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute top-1 bottom-1 w-[88px] rounded-full btn-primary-glow"
            style={{ left: yearly ? 92 : 4 }}
          />
          <button onClick={() => setYearly(false)} className={`relative z-10 w-[88px] py-1.5 text-[13px] font-medium ${!yearly ? "text-white" : "text-white/60"}`}>Aylık</button>
          <button onClick={() => setYearly(true)} className={`relative z-10 w-[88px] py-1.5 text-[13px] font-medium ${yearly ? "text-white" : "text-white/60"}`}>Yıllık</button>
        </div>
        <span className="ml-3 text-[11px] font-mono text-[#4ADE80]">%20 indirim</span>
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
        {tiers.map(t => {
          const price = yearly ? Math.round(t.price * 0.8) : t.price;
          return (
            <div
              key={t.name}
              className={`relative ${t.popular ? "gradient-border md:scale-[1.04] md:-my-2 shadow-[0_0_60px_-15px_rgba(79,122,255,0.5)]" : "card-depth"} p-7 flex flex-col`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#4F7AFF] text-white shadow-[0_0_20px_-2px_rgba(79,122,255,0.7)]">
                  En popüler
                </div>
              )}
              <div className="text-sm font-medium text-white/80">{t.name}</div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-white">{fmt(price)}</span>
                <span className="text-sm text-white/50">/ay</span>
              </div>
              <div className="mt-1 text-[12px] font-mono text-white/40">{t.minutes.toLocaleString("tr-TR")} dakika dahil</div>
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
                  t.popular ? "btn-primary-glow text-white" : "btn-secondary-dark text-white"
                }`}
              >
                {t.name}'i Seç
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- demo call modal ----------------------- */

function DemoCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const lines = SECTOR_DEMOS[0].lines;

  useEffect(() => { if (!open) { stopSpeech(); setPlaying(false); setActive(-1); } }, [open]);

  const play = async () => {
    if (playing) { stopSpeech(); setPlaying(false); setActive(-1); return; }
    setPlaying(true);
    for (let i = 0; i < lines.length; i++) {
      setActive(i);
      await new Promise<void>(resolve => {
        const u = speak(lines[i].text, { voiceIdx: lines[i].role === "ai" ? 0 : 1, pitch: lines[i].role === "ai" ? 1.05 : 0.95 });
        if (!u) { setTimeout(resolve, 1300); return; }
        u.onend = () => resolve(); u.onerror = () => resolve();
      });
    }
    setPlaying(false); setActive(-1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="card-depth w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Demo Arama</div>
              <button onClick={onClose} className="text-white/50 hover:text-white"><X className="size-4" /></button>
            </div>
            <div className="flex flex-col items-center text-center pb-4 border-b border-white/5">
              <div className="size-20 rounded-full bg-[#4F7AFF]/20 border border-[#4F7AFF]/30 flex items-center justify-center mb-3">
                <Phone className="size-8 text-[#4F7AFF]" />
              </div>
              <div className="text-white font-medium">Beyaz Diş Polikliniği</div>
              <div className="text-[12px] text-white/50 font-mono">+90 532 555 0142</div>
              <button
                onClick={play}
                className="mt-4 inline-flex items-center gap-2 btn-primary-glow text-white px-5 py-2.5 rounded-full text-sm font-medium"
              >
                {playing ? <><Pause className="size-4" /> Durdur</> : <><Play className="size-4" /> Aramayı Dinle</>}
              </button>
            </div>
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
              {lines.map((l, i) => (
                <div key={i} className={`flex ${l.role === "caller" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] px-3 py-2 rounded-xl text-[13px] transition-all ${
                    active === i ? "ring-1 ring-[#4F7AFF]/70 scale-[1.02]" : "opacity-70"
                  } ${l.role === "caller" ? "bg-white/10 text-white border border-white/10" : "bg-[#4F7AFF] text-white"}`}>
                    {l.text}
                  </div>
                </div>
              ))}
            </div>
            <a href="#features" onClick={onClose} className="block mt-4 text-center text-[12px] text-white/50 hover:text-white">Bu nasıl çalışır? →</a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------- trial modal ----------------------- */

function TrialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("Diş Hekimi");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!open) { setSubmitted(false); setPhone(""); } }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Lead capture placeholder — replace with real Formspree endpoint
      await fetch("https://formspree.io/f/placeholder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ phone: "+90" + phone, industry }),
      }).catch(() => {});
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="card-depth w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Ücretsiz Dene</div>
              <button onClick={onClose} className="text-white/50 hover:text-white"><X className="size-4" /></button>
            </div>

            {!submitted ? (
              <>
                <h3 className="font-display text-2xl text-white">Sizi 30 saniyede arayalım</h3>
                <p className="text-[13px] text-white/60 mt-1">Numaranızı bırakın, Sentinel sizi arasın. Hiçbir kart bilgisi gerekmez.</p>
                <form onSubmit={submit} className="mt-5 space-y-3">
                  <div>
                    <label className="text-[12px] text-white/60 font-mono">Telefon numarası</label>
                    <div className="mt-1 flex items-center border border-white/10 rounded-lg bg-white/[0.04] focus-within:border-[#4F7AFF]/50">
                      <span className="px-3 py-2.5 text-white/50 font-mono text-sm border-r border-white/10">+90</span>
                      <input
                        type="tel" required value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="532 555 0142"
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] text-white/60 font-mono">Sektör</label>
                    <select
                      value={industry} onChange={e => setIndustry(e.target.value)}
                      className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F7AFF]/50"
                    >
                      {["Diş Hekimi", "Klima Servis", "Veteriner", "Restoran", "Kuaför", "Diğer"].map(o => (
                        <option key={o} value={o} className="bg-[#14171E]">{o}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit" disabled={submitting || phone.length < 10}
                    className="w-full mt-2 btn-primary-glow text-white px-4 py-3 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? "Gönderiliyor…" : <>Beni Ara <ArrowRight className="size-4" /></>}
                  </button>
                  <p className="text-[11px] text-white/40 text-center">KVKK uyumlu · Numaranız sadece bu demo için kullanılır.</p>
                </form>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="size-14 mx-auto rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/40 flex items-center justify-center mb-4">
                  <Check className="size-7 text-[#4ADE80]" />
                </div>
                <h3 className="font-display text-xl text-white">Sizi aramamızı bekleyin</h3>
                <p className="text-[13px] text-white/60 mt-2">+90 {phone} numarasını 30 saniye içinde arayacağız.</p>
                <button onClick={onClose} className="mt-5 text-[13px] text-white/70 hover:text-white">Kapat</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------- page ----------------------- */

function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-[#0A0B0F] text-white antialiased">
      <Nav onTrial={() => setTrialOpen(true)} />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="absolute inset-0 bg-grid-brand [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="orb orb-blue" style={{ width: 720, height: 720, bottom: -300, right: -200 }} />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-[11px] font-mono px-2.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/70"
            >
              <span className="size-1.5 rounded-full bg-[#4F7AFF] dot-pulse" />
              Erken erişim açık
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display font-semibold text-[#F5F5F7] mt-6"
              style={{ fontSize: "clamp(44px, 6.5vw, 80px)", lineHeight: 1.02, letterSpacing: "-0.03em" }}
            >
              Telefonunuz artık<br/>her zaman açık.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-[17px] text-white/60 max-w-xl leading-relaxed"
            >
              Sentinel her aramaya cevap verir, randevu alır, asla uyumaz. Sizin gibi konuşur. 5 dakikada kurulur.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => setTrialOpen(true)}
                className="group inline-flex items-center gap-2 btn-primary-glow text-white px-5 py-3 rounded-lg text-[14px] font-medium"
              >
                Ücretsiz Dene <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center gap-2 btn-secondary-dark text-white px-5 py-3 rounded-lg text-[14px] font-medium"
              >
                <Play className="size-3.5 fill-current" /> Demo Aramayı Dinle
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/55"
            >
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#4F7AFF]" /> 5 dakikada kurulum</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#4F7AFF]" /> Kart bilgisi gerekmez</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#4F7AFF]" /> İstediğiniz zaman iptal</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <DemoCard />
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST ROW ===== */}
      <section className="relative border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-[13px]">
          {[
            { icon: MapPin, text: "Türkiye'de geliştirildi" },
            { icon: Languages, text: "Türkçe diline özel optimize" },
            { icon: ShieldCheck, text: "KVKK uyumlu" },
            { icon: Wrench, text: "İstanbul merkezli destek" },
          ].map(({ icon: I, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-white/70">
              <I className="size-4 text-[#4F7AFF]" /> {text}
            </div>
          ))}
        </div>
      </section>

      {/* ===== VOICE PICKER ===== */}
      <section className="relative py-24 md:py-28">
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Sesler</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-white" style={{ letterSpacing: "-0.025em" }}>
                Sesini seçin. Hemen dinleyin.
              </h2>
              <p className="mt-3 text-white/60">Türkçe için optimize edilmiş 5 farklı karakter. Tıklayın, kendiniz duyun.</p>
            </div>
          </Reveal>
          <Reveal delay={0.05}><VoicePicker /></Reveal>
        </div>
      </section>

      {/* ===== FEATURES BENTO ===== */}
      <section id="features" className="relative py-24 md:py-28 border-t border-white/5">
        <div className="absolute inset-0 bg-grid-brand opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Özellikler</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-white tracking-tight" style={{ letterSpacing: "-0.025em" }}>
                İyi bir resepsiyonistin yaptığı her şey.<br/>
                <span className="text-white/50">Hastalandığında bile.</span>
              </h2>
            </div>
          </Reveal>
          <div className="mt-14">
            <BentoCards />
          </div>
        </div>
      </section>

      {/* ===== LIVE DEMO ===== */}
      <section id="demo" className="relative py-24 md:py-28 border-t border-white/5">
        <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_1.3fr] gap-10 items-center">
          <Reveal>
            <div>
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Canlı Deneyin</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-white" style={{ letterSpacing: "-0.025em" }}>
                Önce duyun, sonra karar verin.
              </h2>
              <p className="mt-4 text-white/60 leading-relaxed">
                Sektörünüzü seçin, gerçek bir Sentinel konuşmasını dinleyin. Her senaryo
                farklı bir karakter ve ton. Sizin sektörünüzde nasıl konuştuğunu görün.
              </p>
              <button
                onClick={() => setTrialOpen(true)}
                className="mt-6 inline-flex items-center gap-2 btn-primary-glow text-white px-5 py-2.5 rounded-lg text-[13px] font-medium"
              >
                Kendi Aramamı Al <ArrowRight className="size-4" />
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.05}><LiveDemo /></Reveal>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative py-24 md:py-28 border-t border-white/5">
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -100, left: "30%", opacity: 0.5 }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-10">
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#4F7AFF]">Fiyatlar</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-white" style={{ letterSpacing: "-0.025em" }}>
                Dakika başı ödeyin, koltuk başı değil.
              </h2>
              <p className="mt-3 text-white/60">5 dakikada başlayın. İstediğiniz zaman iptal edin.</p>
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
            5 dakikada hazır.
          </h2>
          <p className="mt-3 text-white/60">Kart bilgisi yok. Kendi numaranızı getirin veya yeni bir tane seçin.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setTrialOpen(true)}
              className="inline-flex items-center gap-2 btn-primary-glow text-white px-6 py-3 rounded-lg text-sm font-medium"
            >
              Ücretsiz Dene <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative border-t border-white/5 bg-[#08090D]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <div className="font-display text-4xl font-semibold text-white">Sentinel</div>
              <p className="mt-3 text-sm text-white/50 max-w-xs">Her aramaya cevap veren, her randevuyu alan ve asla mola vermeyen AI resepsiyonist.</p>
              <form className="mt-6 flex max-w-sm" onSubmit={e => e.preventDefault()}>
                <input
                  type="email" placeholder="siz@firmaniz.com"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-l-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#4F7AFF]/50"
                />
                <button className="btn-primary-glow text-white px-4 rounded-r-lg text-sm font-medium">Abone Ol</button>
              </form>
            </div>

            {[
              { title: "Ürün", links: ["Özellikler","Fiyatlar","Sürüm Notları","Yol Haritası"] },
              { title: "Şirket", links: ["Hakkımızda","Müşteriler","Kariyer","İletişim"] },
              { title: "Kaynaklar", links: ["Dokümanlar","API","Rehberler","Destek"] },
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
              Tüm sistemler çalışıyor
            </div>
            <div className="text-[12px] text-white/40">© 2026 Sentinel · İstanbul</div>
            <div className="flex items-center gap-3 text-white/40">
              <a href="#" className="hover:text-white transition"><Twitter className="size-4" /></a>
              <a href="#" className="hover:text-white transition"><Github className="size-4" /></a>
              <a href="#" className="hover:text-white transition"><Linkedin className="size-4" /></a>
            </div>
          </div>
        </div>
      </footer>

      <DemoCallModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      <TrialModal open={trialOpen} onClose={() => setTrialOpen(false)} />
    </div>
  );
}
