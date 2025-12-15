"use client";

import { Home, Users, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // ייבוא רכיב תמונה
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Calendar } from "lucide-react";


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <nav className="flex flex-col h-full bg-white text-slate-600">
      
      {/* אזור הלוגו */}
      <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
        <div className="relative w-20 h-20 mb-3">
           {/* כאן נכנסת התמונה ששמרת בתיקיית public */}
           <Image 
             src="/logo.png" 
             alt="לוגו מעון קודשך" 
             fill 
             className="object-contain"
             priority
           />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          מעון קודשך
        </h1>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
          מערכת ניהול קהילה
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <SidebarItem 
          icon={<Home size={20} />} 
          label="דף הבית" 
          href="/dashboard" 
          active={pathname === "/dashboard"} 
        />
        
        <SidebarItem 
          icon={<Users size={20} />} 
          label="ניהול משפחה" 
          href="/dashboard/family" 
          active={pathname === "/dashboard/family"} 
        />

        <SidebarItem 
  icon={<Calendar size={20} />} 
  label="אירועים אישיים" 
  href="/dashboard/events" 
  active={pathname === "/dashboard/events"} 
/>

      </div>


      <div className="p-4 border-t border-slate-100">
        <SidebarItem 
          icon={<LogOut size={20} />} 
          label="התנתק מהמערכת" 
          onClick={handleLogout}
          danger 
        />
      </div>
    </nav>
  );
}

function SidebarItem({ icon, label, href, onClick, active = false, danger = false }: any) {
  const baseClasses = `
    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm w-full cursor-pointer
    ${active 
      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
      : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
    }
    ${danger ? "text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 mt-2" : ""}
  `;

  const iconClass = active ? "text-blue-600" : (danger ? "text-red-500" : "text-slate-400");

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        <span className={iconClass}>{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href={href || "#"} className={baseClasses}>
      <span className={iconClass}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
