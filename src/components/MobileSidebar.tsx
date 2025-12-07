"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar - רק במובייל */}
      <div className="flex md:hidden items-center justify-between p-4 bg-white border-b shadow-sm">
        <button onClick={() => setOpen(true)} aria-label="פתח תפריט">
          <Menu size={28} />
        </button>
        <span className="text-xl font-bold">Shul CRM</span>
      </div>

      {/* Overlay + Sidebar */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white border-l shadow-lg transform transition-transform duration-300 z-50 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Sidebar />
      </div>
    </>
  );
}
