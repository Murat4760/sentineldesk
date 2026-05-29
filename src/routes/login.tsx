import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LiveWaveform } from "@/components/effects/Waveform";
import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  component: Login,
});

function Login() {
  return <AuthLayout mode="signin" />;
}

export function AuthLayout({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const search = mode === "signin" ? Route.useSearch() : { redirect: "/dashboard" };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const title = mode === "signin" ? "Tekrar hoş geldiniz" : "Ücretsiz hesap oluşturun";
  const sub = mode === "signin" ? "Sentinel panelinize giriş yapın" : "Kart bilgisi gerekmez";
  const cta = mode === "signin" ? "Giriş yap" : "Hesap oluştur";
  const altText = mode === "signin" ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?";
  const altLink = mode === "signin" ? "/signup" : "/login";
  const altLabel = mode === "signin" ? "Oluşturun" : "Giriş yapın";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Hesabınız oluşturuldu.");
          navigate({ to: "/dashboard", replace: true });
        } else {
          toast.success("Hesap oluşturuldu. E-postanızı doğrulayın.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bir hata oluştu";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + search.redirect,
      });
      if (result.error) {
        toast.error(result.error.message || "Google ile giriş başarısız");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: search.redirect, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="flex flex-col p-8 md:p-12">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="size-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">S</div>
          Sentinel
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="m-auto w-full max-w-sm"
        >
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium">E-posta</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@sirket.com" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition" />
            </div>
            <div>
              <label className="text-xs font-medium">Parola</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition" />
            </div>
            {mode === "signin" && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                  Parolanızı mı unuttunuz?
                </Link>
              </div>
            )}
            {errorMessage && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
            <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-1.5 disabled:opacity-60">
              {loading ? "Lütfen bekleyin…" : cta} <ArrowRight className="size-3.5" />
            </button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 border-t border-border" /> veya <div className="flex-1 border-t border-border" />
          </div>
          <button onClick={handleGoogle} disabled={loading} className="w-full h-10 rounded-md border border-border bg-card text-sm hover:border-foreground/20 transition inline-flex items-center justify-center gap-2 disabled:opacity-60">
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/></svg>
            Google ile devam et
          </button>
          <p className="mt-8 text-xs text-muted-foreground text-center">
            {altText} <Link to={altLink} className="text-foreground font-medium hover:underline">{altLabel}</Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden md:flex relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative m-auto max-w-md p-12 text-left">
          <div className="border border-background/20 rounded-xl p-5 bg-background/5 backdrop-blur">
            <div className="flex items-center gap-2 text-xs">
              <span className="size-1.5 rounded-full bg-[color:var(--color-success)] pulse-ring" />
              Canlı arama
              <span className="ml-auto font-mono opacity-60">00:42</span>
            </div>
            <LiveWaveform bars={40} className="mt-4 h-12" />
            <div className="mt-4 text-sm opacity-80">"…Cuma sabah 9'da veya Pazartesi 11'de boş yer var — hangisi sizin için uygun?"</div>
          </div>
          <blockquote className="mt-10 text-xl font-medium leading-snug tracking-tight">
            "İlk ayda %38 daha fazla randevu aldık. Bir haftada masrafını çıkarıyor."
          </blockquote>
          <div className="mt-4 text-sm opacity-60">— Murat Çelik, Sahip · Çelik Tesisat</div>
        </div>
      </div>
    </div>
  );
}
