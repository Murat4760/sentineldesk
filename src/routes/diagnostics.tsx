import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "Sistem Tanılama — Sentinel" },
      { name: "description", content: "Supabase bağlantısı ve giriş akışı kontrol ekranı." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Diagnostics,
});

type Status = "idle" | "running" | "ok" | "fail";

interface Check {
  label: string;
  status: Status;
  detail?: string;
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "running") return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  if (status === "ok") return <CheckCircle2 className="size-4 text-[color:var(--color-success)]" />;
  if (status === "fail") return <XCircle className="size-4 text-destructive" />;
  return <span className="size-4 inline-block rounded-full border border-border" />;
}

function Diagnostics() {
  const [checks, setChecks] = useState<Check[]>([
    { label: "Ortam değişkenleri (URL & anahtar)", status: "idle" },
    { label: "Supabase Auth erişilebilir", status: "idle" },
    { label: "Veritabanı sorgusu (customers)", status: "idle" },
    { label: "Mevcut oturum", status: "idle" },
  ]);
  const [running, setRunning] = useState(false);

  // Login test state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<Status>("idle");
  const [loginDetail, setLoginDetail] = useState<string>("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  function update(i: number, patch: Partial<Check>) {
    setChecks((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  async function refreshSession() {
    const { data } = await supabase.auth.getSession();
    setSessionEmail(data.session?.user.email ?? null);
  }

  async function runChecks() {
    setRunning(true);
    setChecks((prev) => prev.map((c) => ({ ...c, status: "running", detail: undefined })));

    // 1. Env vars
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (url && key) {
      update(0, { status: "ok", detail: new URL(url).host });
    } else {
      update(0, { status: "fail", detail: "VITE_SUPABASE_URL / PUBLISHABLE_KEY eksik" });
    }

    // 2. Auth reachable
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      update(1, { status: "ok", detail: "Auth servisine ulaşıldı" });
    } catch (e) {
      update(1, { status: "fail", detail: e instanceof Error ? e.message : "Bilinmeyen hata" });
    }

    // 3. DB query
    try {
      const { error } = await supabase.from("customers").select("id", { count: "exact", head: true });
      if (error) throw error;
      update(2, { status: "ok", detail: "Sorgu başarılı (RLS aktif)" });
    } catch (e) {
      update(2, { status: "fail", detail: e instanceof Error ? e.message : "Bilinmeyen hata" });
    }

    // 4. Current session
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        update(3, { status: "ok", detail: "Oturum yok (anonim)" });
        setSessionEmail(null);
      } else {
        update(3, { status: "ok", detail: `Giriş yapılmış: ${data.user.email}` });
        setSessionEmail(data.user.email ?? null);
      }
    } catch (e) {
      update(3, { status: "fail", detail: e instanceof Error ? e.message : "Bilinmeyen hata" });
    }

    setRunning(false);
  }

  useEffect(() => {
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLoginTest(e: FormEvent) {
    e.preventDefault();
    setLoginStatus("running");
    setLoginDetail("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data } = await supabase.auth.getUser();
      setLoginStatus("ok");
      setLoginDetail(`Giriş başarılı: ${data.user?.email}`);
      setSessionEmail(data.user?.email ?? null);
    } catch (err) {
      setLoginStatus("fail");
      setLoginDetail(err instanceof Error ? err.message : "Giriş başarısız");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    await refreshSession();
    setLoginStatus("idle");
    setLoginDetail("Oturum kapatıldı");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sistem Tanılama</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Supabase bağlantısı ve giriş akışı kontrolü
            </p>
          </div>
          <button
            onClick={runChecks}
            disabled={running}
            className="h-9 px-3 rounded-md border border-border bg-card text-sm inline-flex items-center gap-2 hover:border-foreground/20 transition disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${running ? "animate-spin" : ""}`} /> Yeniden çalıştır
          </button>
        </div>

        {/* Connection checks */}
        <div className="mt-8 rounded-xl border border-border bg-card divide-y divide-border">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <StatusIcon status={c.status} />
              <div className="flex-1">
                <div className="text-sm font-medium">{c.label}</div>
                {c.detail && (
                  <div className="text-xs text-muted-foreground mt-0.5 break-all">{c.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Login flow test */}
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Giriş akışı testi</h2>
          <p className="text-xs text-muted-foreground mt-1">
            E-posta/parola ile gerçek bir giriş denemesi yapar ve oturumu doğrular.
          </p>

          {sessionEmail ? (
            <div className="mt-4 flex items-center justify-between rounded-md border border-border p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Aktif oturum: </span>
                <span className="font-medium">{sessionEmail}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="h-8 px-3 rounded-md border border-border text-sm hover:border-foreground/20 transition"
              >
                Çıkış yap
              </button>
            </div>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={handleLoginTest}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                disabled={loginStatus === "running"}
                className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loginStatus === "running" ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Test ediliyor…
                  </>
                ) : (
                  "Girişi test et"
                )}
              </button>
            </form>
          )}

          {loginDetail && (
            <div
              className={`mt-3 flex items-center gap-2 text-sm ${
                loginStatus === "fail" ? "text-destructive" : "text-[color:var(--color-success)]"
              }`}
            >
              <StatusIcon status={loginStatus === "idle" ? "ok" : loginStatus} />
              {loginDetail}
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Bu sayfa yalnızca tanılama amaçlıdır ve arama motorlarınca dizine eklenmez.
        </p>
      </div>
    </div>
  );
}
