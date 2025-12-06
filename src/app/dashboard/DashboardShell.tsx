"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile?: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-l h-screen sticky top-0">
        <Sidebar profile={profile} />
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl animate-slide-left border-l">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-lg font-bold">תפריט</span>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <Sidebar profile={profile} />
          </div>

        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 right-0 left-0 bg-white border-b shadow-sm z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setOpen(true)} className="p-2 hover:bg-gray-100 rounded">
            ☰
          </button>
          <div className="font-bold text-lg text-blue-700">Synagogue CRM</div>
          <div className="w-6" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-8 py-6 md:mt-0 mt-16">
        {children}
      </main>
    </div>
  );
}
