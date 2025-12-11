"use client";

import { Home, Calendar, Users, LogOut, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-white text-slate-600">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          מעון קודשך
        </h1>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
          מערכת ניהול קהילה
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <SidebarItem 
          icon={<Home size={20} />} 
          label="דף הבית" 
          href="/dashboard" 
          active={pathname === "/dashboard"} 
        />
        <SidebarItem 
          icon={<MessageSquare size={20} />} 
          label="הודעות ועדכונים" 
          href="/dashboard/messages" 
          active={pathname === "/dashboard/messages"} 
        />
        <SidebarItem 
          icon={<Calendar size={20} />} 
          label="זמני תפילות" 
          href="/dashboard/schedule" 
          active={pathname === "/dashboard/schedule"} 
        />
        <SidebarItem 
          icon={<Users size={20} />} 
          label="ניהול משפחה" 
          href="/dashboard/family" 
          active={pathname === "/dashboard/family"} 
        />
        
        <div className="pt-4 mt-4 border-t border-slate-100">
           <p className="px-3 text-xs font-semibold text-slate-400 mb-2">הגדרות</p>
           <SidebarItem 
            icon={<Settings size={20} />} 
            label="הגדרות חשבון" 
            href="/dashboard/settings" 
            active={pathname === "/dashboard/settings"} 
          />
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <SidebarItem 
          icon={<LogOut size={20} />} 
          label="התנתק מהמערכת" 
          href="/sign-out" 
          danger 
        />
      </div>
    </nav>
  );
}

function SidebarItem({ icon, label, href, active = false, danger = false }: any) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
        ${active 
          ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
        }
        ${danger ? "text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 mt-2" : ""}
      `}
    >
      <span className={active ? "text-blue-600" : (danger ? "text-red-500" : "text-slate-400")}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
