import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Plus, X } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { saveOnboarding, type Industry } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const steps = ["İşletme", "Çalışma Saatleri", "Hizmetler", "Karşılama"];

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Pazartesi" },
  { key: "tue", label: "Salı" },
  { key: "wed", label: "Çarşamba" },
  { key: "thu", label: "Perşembe" },
  { key: "fri", label: "Cuma" },
  { key: "sat", label: "Cumartesi" },
  { key: "sun", label: "Pazar" },
];

type Hours = Record<DayKey, { open: string; close: string; closed: boolean }>;

const defaultHours: Hours = {
  mon: { open: "09:00", close: "18:00", closed: false },
  tue: { open: "09:00", close: "18:00", closed: false },
  wed: { open: "09:00", close: "18:00", closed: false },
  thu: { open: "09:00", close: "18:00", closed: false },
  fri: { open: "09:00", close: "18:00", closed: false },
  sat: { open: "09:00", close: "14:00", closed: false },
  sun: { open: "09:00", close: "18:00", closed: true },
};

const INDUSTRIES: { id: Industry; label: string; services: string[] }[] = [
  { id: "dental", label: "Diş Kliniği", services: ["Temizlik", "Dolgu", "Kontrol"] },
  { id: "salon", label: "Kuaför / Güzellik", services: ["Saç Kesimi", "Manikür", "Kaş"] },
  { id: "hvac", label: "Klima / Tesisat", services: ["Arıza", "Montaj", "Bakım"] },
  { id: "restaurant", label: "Restoran", services: ["Rezervasyon"] },
  { id: "other", label: "Diğer", services: ["Randevu"] },
];

function Onboarding() {
  const nav = useNavigate();
  const save = useServerFn(saveOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<Industry>("dental");
  const [hours, setHours] = useState<Hours>(defaultHours);
  const [services, setServices] = useState<string[]>(INDUSTRIES[0].services);
  const [newService, setNewService] = useState("");
  const [greeting, setGreeting] = useState("");
  const [saving, setSaving] = useState(false);

  const defaultGreeting = useMemo(
    () =>
      `Merhaba, ${name || "İşletmeniz"}'e hoş geldiniz! Size nasıl yardımcı olabilirim?`,
    [name]
  );
  const effectiveGreeting = greeting.trim() || defaultGreeting;

  function pickIndustry(id: Industry) {
    setIndustry(id);
    const found = INDUSTRIES.find((i) => i.id === id);
    if (found) setServices(found.services);
  }

  function addService() {
    const v = newService.trim();
    if (!v) return;
    if (services.includes(v)) return;
    setServices((s) => [...s, v]);
    setNewService("");
  }

  async function finish() {
    setSaving(true);
    try {
      await save({
        data: {
          name: name.trim(),
          industry,
          businessHours: hours,
          services,
          greeting: effectiveGreeting,
        },
      });
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      toast.success("İşletmeniz oluşturuldu.");
      setTimeout(() => nav({ to: "/dashboard" }), 700);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
      setSaving(false);
    }
  }

  function next() {
    if (step === 0 && !name.trim()) {
      toast.error("Lütfen işletme adını girin.");
      return;
    }
    if (step === steps.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border h-14 px-6 flex items-center">
        <div className="flex items-center gap-2 font-semibold">
          <div className="size-6 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">S</div>
          Sentinel
        </div>
        <div className="ml-auto text-xs text-muted-foreground font-mono">Adım {step + 1} / {steps.length}</div>
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
                <h1 className="text-2xl font-semibold tracking-tight">İşletmenizi tanıtın</h1>
                <p className="mt-1 text-sm text-muted-foreground">Agent'ın aramaları nasıl karşılayacağını buna göre kişiselleştiriyoruz.</p>
                <div className="mt-8 grid gap-5">
                  <div>
                    <label className="text-xs font-medium">İşletme adı</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gülümseme Diş Kliniği" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-card text-sm outline-none focus:border-primary transition" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Sektör</label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {INDUSTRIES.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => pickIndustry(i.id)}
                          className={`text-left border rounded-lg px-3 py-2.5 text-sm transition ${industry === i.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"}`}
                        >
                          {i.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Çalışma saatleri</h1>
                <p className="mt-1 text-sm text-muted-foreground">Agent bu saatlere göre randevu önerir.</p>
                <div className="mt-8 grid gap-2">
                  {DAYS.map((d) => {
                    const h = hours[d.key];
                    return (
                      <div key={d.key} className="flex items-center gap-3 border border-border rounded-lg bg-card px-3 py-2">
                        <div className="w-24 text-sm font-medium">{d.label}</div>
                        {h.closed ? (
                          <div className="flex-1 text-sm text-muted-foreground">Kapalı</div>
                        ) : (
                          <div className="flex-1 flex items-center gap-2">
                            <input type="time" value={h.open} onChange={(e) => setHours((p) => ({ ...p, [d.key]: { ...p[d.key], open: e.target.value } }))} className="h-9 px-2 rounded-md border border-input bg-background text-sm outline-none focus:border-primary" />
                            <span className="text-muted-foreground text-xs">–</span>
                            <input type="time" value={h.close} onChange={(e) => setHours((p) => ({ ...p, [d.key]: { ...p[d.key], close: e.target.value } }))} className="h-9 px-2 rounded-md border border-input bg-background text-sm outline-none focus:border-primary" />
                          </div>
                        )}
                        <button
                          onClick={() => setHours((p) => ({ ...p, [d.key]: { ...p[d.key], closed: !p[d.key].closed } }))}
                          className="text-xs text-muted-foreground hover:text-foreground transition"
                        >
                          {h.closed ? "Aç" : "Kapalı işaretle"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Hizmetler</h1>
                <p className="mt-1 text-sm text-muted-foreground">Müşterilerin randevu alabileceği hizmetleri listeleyin.</p>
                <div className="mt-8">
                  <div className="flex gap-2">
                    <input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }}
                      placeholder="Hizmet ekle (örn. Temizlik)"
                      className="flex-1 h-10 px-3 rounded-md border border-input bg-card text-sm outline-none focus:border-primary transition"
                    />
                    <button onClick={addService} className="inline-flex items-center gap-1.5 bg-foreground text-background px-3 rounded-md text-sm font-medium hover:opacity-90 transition">
                      <Plus className="size-3.5" /> Ekle
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {services.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1.5 border border-border bg-card rounded-full pl-3 pr-2 py-1 text-sm">
                        {s}
                        <button onClick={() => setServices((arr) => arr.filter((x) => x !== s))} className="text-muted-foreground hover:text-foreground">
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))}
                    {services.length === 0 && <span className="text-sm text-muted-foreground">Henüz hizmet eklenmedi.</span>}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Karşılama mesajı</h1>
                <p className="mt-1 text-sm text-muted-foreground">Agent telefonu bu mesajla açacak.</p>
                <div className="mt-8 grid gap-4">
                  <textarea
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    rows={3}
                    placeholder={defaultGreeting}
                    className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm outline-none focus:border-primary transition resize-none"
                  />
                  <div className="border border-primary/30 bg-primary/5 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Önizleme</div>
                    <div className="text-sm italic">"{effectiveGreeting}"</div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-border h-16 px-6 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || saving}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground disabled:opacity-30 hover:text-foreground transition"
        >
          <ArrowLeft className="size-3.5" /> Geri
        </button>
        <button
          onClick={next}
          disabled={saving}
          className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {step === steps.length - 1 ? (saving ? "Kaydediliyor…" : "Bitir") : "Devam"}
          {step === steps.length - 1 ? <Check className="size-3.5" /> : <ArrowRight className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
