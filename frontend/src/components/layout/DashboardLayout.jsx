import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative overflow-x-hidden">
      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar (drawer on mobile, sticky on desktop) ── */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* ── Main content area — flush alignment next to sidebar without mx-auto gaps ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuToggle={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-7 w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
