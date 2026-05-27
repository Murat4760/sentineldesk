import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Props {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  decimals?: number;
  sub?: string;
  index?: number;
}

export function StatCard({ label, value, suffix, prefix, trend, decimals = 0, sub, index = 0 }: Props) {
  const up = (trend ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="border border-border bg-card rounded-lg p-5 hover:border-foreground/20 transition-colors"
    >
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
          {prefix}<CountUp end={value} duration={1.2} decimals={decimals} separator="," />{suffix}
        </span>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-[color:var(--color-success)]" : "text-destructive"}`}>
            {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </motion.div>
  );
}
