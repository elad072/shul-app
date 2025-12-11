"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Menu } from "lucide-react";

export function MobileTabs() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around py-3 pb-safe lg:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Tab icon={<Home size={22} />} label="בית" href="/dashboard" active={pathname === "/dashboard"} />
      <Tab icon={<Calendar size={22} />} label="לוח" href="/dashboard/schedule" active={pathname === "/dashboard/schedule"} />
      <Tab icon={<Users size={22} />} label="משפחה" href="/dashboard/family" active={pathname === "/dashboard/family"} />
      <Tab icon={<Menu size={22} />} label="עוד" href="/dashboard/menu" active={pathname === "/dashboard/menu"} />
    </div>
  );
}

function Tab({ icon, label, href, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
