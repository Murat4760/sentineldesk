import { Search, Bell, Moon, Sun, Command as CmdIcon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function TopBar({ onOpenCmd }: { onOpenCmd: () => void }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0">
      <button
        onClick={onOpenCmd}
        className="flex-1 max-w-md h-9 px-3 rounded-md border border-border bg-card flex items-center gap-2 text-sm text-muted-foreground hover:border-foreground/20 transition"
      >
        <Search className="size-4" />
        <span>Search calls, customers, settings…</span>
        <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-muted">
          <CmdIcon className="size-2.5" />K
        </span>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <button onClick={toggle} className="size-9 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button className="size-9 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition relative">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
        </button>
        <div className="ml-2 size-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">MK</div>
      </div>
    </header>
  );
}
