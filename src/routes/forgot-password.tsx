import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Parola sıfırlama bağlantısı gönderildi.");
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
        <h1 className="text-2xl font-semibold tracking-tight">Parolanızı mı unuttunuz?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sent
            ? "Gelen kutunuzu kontrol edin. Parola sıfırlama bağlantısını size gönderdik."
            : "E-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim."}
        </p>
        {!sent && (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium">E-posta</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@sirket.com" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary transition" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-1.5 disabled:opacity-60">
              {loading ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"} <ArrowRight className="size-3.5" />
            </button>
          </form>
        )}
        <p className="mt-8 text-xs text-muted-foreground text-center">
          <Link to="/login" className="text-foreground font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="size-3" /> Girişe dön
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
