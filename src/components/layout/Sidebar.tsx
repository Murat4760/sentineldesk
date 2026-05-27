import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutGrid, PhoneCall, Calendar, Bot, Users, BarChart3, CreditCard, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const NAV = [
  { group: "Overview", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/calls", label: "Calls", icon: PhoneCall },
    { to: "/appointments", label: "Appointments", icon: Calendar },
  ]},
  { group: "Build", items: [
    { to: "/agent", label: "Agent", icon: Bot },
    { to: "/customers", label: "Customers", icon: Users },
  ]},
  { group: "Account", items: [
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/billing", label: "Billing", icon: CreditCard },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-sidebar shrink-0 transition-[width] duration-200 ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">R</div>
          {!collapsed && <span className="tracking-tight">Ringly</span>}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((group, gi) => (
          <div key={gi} className="px-2 mb-4">
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.group}</div>
            )}
            {group.items.map(item => {
              const active = pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    active ? "text-foreground bg-sidebar-accent" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="h-10 border-t border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>
    </aside>
  );
}

export function MobileTabBar() {
  const { pathname } = useLocation();
  const items = [NAV[0].items[0], NAV[0].items[1], NAV[0].items[2], NAV[1].items[0], NAV[2].items[2]];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 border-t border-border bg-background z-40 grid grid-cols-5">
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.to);
        return (
          <Link key={item.to} to={item.to} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
