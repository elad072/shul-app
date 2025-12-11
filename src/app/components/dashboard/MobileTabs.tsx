"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, LogOut } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export function MobileTabs() {
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between items-center px-6 py-3 pb-safe lg:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      {/* דף הבית */}
      <Tab 
        icon={<Home size={24} />} 
        label="דף הבית" 
        href="/dashboard" 
        active={pathname === "/dashboard"} 
      />

      {/* ניהול משפחה (הכפתור המרכזי) */}
      <div className="-mt-8">
        <Link href="/dashboard/family">
          <div className={`p-4 rounded-full shadow-lg transition-transform active:scale-95 ${
            pathname === "/dashboard/family" 
              ? "bg-blue-700 text-white ring-4 ring-blue-50" 
              : "bg-blue-600 text-white"
          }`}>
            <Users size={28} />
          </div>
        </Link>
      </div>

      {/* כפתור התנתקות */}
      <button 
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
      >
        <LogOut size={24} />
        <span className="text-[10px] font-medium">יציאה</span>
      </button>

    </div>
  );
}

function Tab({ icon, label, href, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
