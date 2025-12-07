"use client";

import Link from "next/link";
import { Home, Users, UserPlus, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-white border-l border-gray-200 shadow-sm flex flex-col p-4">
      
      {/* Logo */}
      <h1 className="text-2xl font-extrabold text-indigo-600 mb-8 px-2">
        Shul CRM
      </h1>

      {/* Navigation */}
      <nav className="space-y-3 flex-1 text-right">
        <Link href="/dashboard" className="sidebar-link flex items-center justify-end gap-2">
          לוח בקרה
          <Home size={18} />
        </Link>

        <Link href="/dashboard/members" className="sidebar-link flex items-center justify-end gap-2">
          ניהול משתמשים
          <Users size={18} />
        </Link>

        <Link href="/dashboard/add-member" className="sidebar-link flex items-center justify-end gap-2">
          הוספת חבר חדש
          <UserPlus size={18} />
        </Link>
      </nav>

      {/* Logout */}
      <Link
        href="/auth/signout"
        className="flex items-center justify-end gap-2 text-red-600 hover:text-red-700 font-medium mt-4"
      >
        התנתקות
        <LogOut size={18} />
      </Link>
    </aside>
  );
}
