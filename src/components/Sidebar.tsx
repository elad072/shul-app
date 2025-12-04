"use client"; // חובה כי אנחנו משתמשים ב-usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "דף הבית", href: "/dashboard", icon: LayoutDashboard },
    { name: "חברים ומשפחות", href: "/dashboard/members", icon: Users },
    { name: "תרומות", href: "/dashboard/donations", icon: DollarSign },
    { name: "אירועים", href: "/dashboard/events", icon: Calendar },
    { name: "הגדרות", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full text-gray-800">
      {/* לוגו / כותרת עליונה */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
          ב
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">קהילת הקודש</h1>
          <p className="text-xs text-gray-500">מערכת ניהול</p>
        </div>
      </div>

      {/* תפריט ניווט */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                size={20}
                className={
                  isActive
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* כפתור התנתקות למטה */}
      <div className="p-4 border-t border-gray-100">
        <form action="/auth/signout" method="post">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium">
            <LogOut size={20} />
            התנתק
          </button>
        </form>
      </div>
    </div>
  );
}
