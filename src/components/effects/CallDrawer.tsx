import { motion, AnimatePresence } from "framer-motion";
import type { Call } from "@/lib/mock-data";
import { OutcomeBadge, SentimentDot } from "./SentimentBadge";
import { WaveformPlayer } from "./Waveform";
import { X, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CallDrawer({ call, onClose }: { call: Call | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {call && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 flex flex-col"
          >
            <div className="h-14 px-4 border-b border-border flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                {call.callerName.split(" ").map(w => w[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{call.callerName}</div>
                <div className="text-xs text-muted-foreground font-mono">{call.callerPhone}</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <OutcomeBadge outcome={call.outcome} />
                <SentimentDot sentiment={call.sentiment} />
                <Link to="/calls/$id" params={{ id: call.id }} onClick={onClose} className="size-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <ExternalLink className="size-4" />
                </Link>
                <button onClick={onClose} className="size-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <WaveformPlayer duration={call.duration} />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
              {call.transcript.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex ${t.role === "caller" ? "justify-end" : "justify-start"}`}
                >
                  <div className="group max-w-[85%] relative">
                    <div className={`px-3 py-2 rounded-lg text-sm ${t.role === "caller" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {t.text}
                    </div>
                    <div className="absolute -top-4 right-0 text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition">{t.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
