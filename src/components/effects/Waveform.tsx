import { useEffect, useRef, useState } from "react";

export function LiveWaveform({ bars = 24, className = "" }: { bars?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-[2px] h-6 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="wave-bar w-[2px] bg-primary rounded-full h-full"
          style={{ animationDelay: `${(i * 60) % 800}ms`, animationDuration: `${0.7 + (i % 5) * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function StaticWaveform({ seed = 1, bars = 80, className = "" }: { seed?: number; bars?: number; className?: string }) {
  const heights = Array.from({ length: bars }).map((_, i) => {
    const v = Math.sin(i * 0.3 + seed) * 0.5 + Math.sin(i * 0.7 + seed * 2) * 0.3 + 0.5;
    return Math.max(0.15, Math.min(1, v));
  });
  return (
    <div className={`flex items-end gap-[2px] h-12 ${className}`}>
      {heights.map((h, i) => (
        <span key={i} className="w-[2px] bg-primary/60 rounded-full" style={{ height: `${h * 100}%` }} />
      ))}
    </div>
  );
}

export function WaveformPlayer({ duration = 154 }: { duration?: number }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const start = Date.now() - progress * duration * 1000;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / (duration * 1000));
      setProgress(p);
      if (p < 1) ref.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [playing, duration]);

  const bars = 120;
  const heights = Array.from({ length: bars }).map((_, i) => {
    const v = Math.sin(i * 0.25) * 0.4 + Math.sin(i * 0.6) * 0.3 + Math.cos(i * 0.15) * 0.2 + 0.55;
    return Math.max(0.12, Math.min(1, v));
  });
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const playedIdx = Math.floor(progress * bars);

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPlaying(p => !p)}
          className="size-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
          )}
        </button>
        <div
          className="flex-1 flex items-center gap-[2px] h-14 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress((e.clientX - rect.left) / rect.width);
          }}
        >
          {heights.map((h, i) => (
            <span
              key={i}
              className={`flex-1 rounded-full transition-colors ${i <= playedIdx ? "bg-primary" : "bg-border"}`}
              style={{ height: `${h * 100}%`, minWidth: 1 }}
            />
          ))}
        </div>
        <div className="font-mono text-xs text-muted-foreground tabular-nums w-20 text-right">
          {fmt(progress * duration)} / {fmt(duration)}
        </div>
      </div>
    </div>
  );
}
