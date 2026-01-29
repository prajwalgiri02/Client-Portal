"use client";

import { useState } from "react";
import AdminSidebar from "./admin-sidebar";
import AdminTopbar from "./admin-topbar";

type AdminLayoutShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
};

export default function AdminLayoutShell({ children, user }: AdminLayoutShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar with collapsed state */}
      <AdminSidebar collapsed={collapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar with toggle control */}
        <AdminTopbar user={user} onToggleSidebar={() => setCollapsed(!collapsed)} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 md:p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
