import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] text-white/50 hover:text-white transition"
        >
          <ArrowLeft className="size-4" /> Ana sayfaya dön
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-white/60">{subtitle}</p>}
          {updated && (
            <p className="mt-2 text-[12px] font-mono text-white/40">
              Son güncelleme: {updated}
            </p>
          )}

          <div className="legal-prose mt-10 space-y-6 text-[15px] leading-relaxed text-white/75">
            {children}
          </div>

          <div className="mt-14 pt-6 border-t border-white/10 text-[12px] text-white/40">
            Bu metin bilgilendirme amaçlıdır, hukuki danışmanlık yerine geçmez.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold text-white">{heading}</h2>
      <div className="space-y-3 text-white/75">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 list-disc pl-5 marker:text-[#4F7AFF]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
