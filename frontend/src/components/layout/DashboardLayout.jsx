import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative w-full overflow-x-clip">
      {/* ── Desktop sidebar (always visible on desktop, completely out of layout flow on mobile) ── */}
      <div className="hidden lg:block shrink-0">
        <Sidebar isOpen={true} onClose={closeSidebar} />
      </div>

      {/* ── Mobile sidebar drawer (fixed overlay modal, only rendered on mobile when open) ── */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 h-full">
            <Sidebar isOpen={true} onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* ── Main content area — 100% full width on mobile, adjacent to sidebar on desktop ── */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">
        <Topbar onMenuToggle={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-6 lg:p-7 w-full max-w-full space-y-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

