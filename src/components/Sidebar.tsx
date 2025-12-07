"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, UserPlus, LogOut } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "לוח בקרה", icon: <Home size={18} /> },
    { href: "/dashboard/members", label: "ניהול משתמשים", icon: <Users size={18} /> },
    { href: "/dashboard/add-member", label: "הוספת חבר חדש", icon: <UserPlus size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-l border-gray-200 shadow-sm flex flex-col p-4">

      {/* Logo */}
      <h1 className="text-2xl font-extrabold text-indigo-600 mb-8 px-2 text-right">
        Shul CRM
      </h1>

      {/* Navigation */}
      <nav className="space-y-3 flex-1 text-right">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center justify-end gap-2 p-2 rounded-md transition-colors",
              pathname === link.href
                ? "bg-indigo-50 text-indigo-600 font-bold"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {link.label}
            {link.icon}
          </Link>
        ))}
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
