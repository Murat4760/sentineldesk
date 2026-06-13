import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar, MobileTabBar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app")({
  // Disable SSR for the protected subtree: the session lives in
  // localStorage (unreadable on the server), so server-rendering this
  // layout would deliver the authenticated chrome to anonymous visitors.
  // With ssr:false the guard below always runs on the client before render.
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenCmd={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <Toaster position="bottom-right" />
    </div>
  );
}
