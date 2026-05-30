import { Command } from "cmdk";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { callsQueryOptions, customersQueryOptions } from "@/lib/data";
import { LayoutGrid, PhoneCall, Calendar, Bot, Users, BarChart3, CreditCard, Settings, Phone } from "lucide-react";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const nav = useNavigate();
  const { data: calls = [] } = useQuery(callsQueryOptions);
  const { data: customers = [] } = useQuery(customersQueryOptions);


  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;
  const go = (to: string) => { onOpenChange(false); nav({ to }); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={() => onOpenChange(false)}>
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <Command
        className="relative w-full max-w-xl rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          placeholder="Type a command or search…"
          className="w-full h-12 px-4 bg-transparent text-sm outline-none border-b border-border placeholder:text-muted-foreground"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">No results.</Command.Empty>

          <Command.Group heading="Navigate" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[10px]">
            {[
              ["Dashboard", LayoutGrid, "/dashboard"],
              ["Calls", PhoneCall, "/calls"],
              ["Appointments", Calendar, "/appointments"],
              ["Agent", Bot, "/agent"],
              ["Customers", Users, "/customers"],
              ["Analytics", BarChart3, "/analytics"],
              ["Billing", CreditCard, "/billing"],
              ["Settings", Settings, "/settings"],
            ].map(([label, Icon, to]: any) => (
              <Command.Item
                key={to}
                value={label}
                onSelect={() => go(to)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer aria-selected:bg-accent text-foreground"
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Recent calls" className="mt-2 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[10px]">
            {mockCalls.slice(0, 5).map(c => (
              <Command.Item
                key={c.id}
                value={`${c.callerName} ${c.callerPhone}`}
                onSelect={() => go(`/calls/${c.id}`)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer aria-selected:bg-accent"
              >
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-foreground">{c.callerName}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">{c.callerPhone}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Customers" className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:text-muted-foreground">
            {mockCustomers.slice(0, 4).map(c => (
              <Command.Item
                key={c.id}
                value={c.name}
                onSelect={() => go("/customers")}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer aria-selected:bg-accent text-foreground"
              >
                <Users className="size-4 text-muted-foreground" />
                {c.name}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
        <div className="border-t border-border px-3 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Navigate ↑↓ · Select ↵</span>
          <span>esc to close</span>
        </div>
      </Command>
    </div>
  );
}
