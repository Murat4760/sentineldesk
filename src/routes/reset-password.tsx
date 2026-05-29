import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase establishes a recovery session from the URL hash on load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Parolalar eşleşmiyor");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Parolanız güncellendi.");
      navigate({ to: "/login", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-8 md:p-12 bg-background">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <div className="size-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">S</div>
        Sentinel
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="m-auto w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Yeni parola belirleyin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ready ? "Yeni parolanızı girin." : "Sıfırlama bağlantısı doğrulanıyor…"}
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium">Yeni parola</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition" />
          </div>
          <div>
            <label className="text-xs font-medium">Parolayı onayla</label>
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition" />
          </div>
          <button type="submit" disabled={loading || !ready} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-1.5 disabled:opacity-60">
            {loading ? "Güncelleniyor…" : "Parolayı güncelle"} <ArrowRight className="size-3.5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
