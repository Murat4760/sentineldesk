import type { Sentiment, Outcome } from "@/lib/data";

export function SentimentDot({ sentiment }: { sentiment: Sentiment }) {
  const color = sentiment === "positive" ? "bg-[color:var(--color-success)]" : sentiment === "negative" ? "bg-destructive" : "bg-muted-foreground";
  return <span className={`inline-block size-1.5 rounded-full ${color}`} />;
}

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const map: Record<Outcome, string> = {
    booked: "bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] border-[color:var(--color-success)]/20",
    info: "bg-primary/10 text-primary border-primary/20",
    missed: "bg-destructive/10 text-destructive border-destructive/20",
    voicemail: "bg-muted text-muted-foreground border-border",
    transferred: "bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)] border-[color:var(--color-warning)]/30",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${map[outcome]}`}>
      {outcome}
    </span>
  );
}
