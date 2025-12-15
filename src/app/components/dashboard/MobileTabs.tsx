"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, LogOut, Calendar, ShieldAlert } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

export function MobileTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [isGabbai, setIsGabbai] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // בדיקה האם המשתמש הוא גבאי
  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_gabbai")
          .eq("id", user.id)
          .single();
        if (data?.is_gabbai) setIsGabbai(true);
      }
    }
    checkRole();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/sign-in");
      router.refresh();
    }
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 pb-safe lg:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex justify-between items-end">
        
        {/* צד ימין */}
        <div className="flex gap-1 w-full justify-start">
          <Tab 
            icon={<Home size={22} />} 
            label="בית" 
            href="/dashboard" 
            active={pathname === "/dashboard"} 
          />
          
          <Tab 
            icon={<Calendar size={22} />} 
            label="אירועים" 
            href="/dashboard/events" 
            active={isActive("/dashboard/events")} 
          />
        </div>

        {/* כפתור אמצעי - משפחה */}
        <div className="relative -top-6 mx-1 shrink-0">
          <Link href="/dashboard/family">
            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-slate-50 transition-transform active:scale-95 ${
              isActive("/dashboard/family")
                ? "bg-blue-600 text-white" 
                : "bg-slate-900 text-white"
            }`}>
              <Users size={24} />
            </div>
          </Link>
        </div>

        {/* צד שמאל */}
        <div className="flex gap-1 w-full justify-end">
          
          {/* כפתור גבאי - מופיע רק אם יש הרשאה */}
          {isGabbai && (
             <Tab 
               icon={<ShieldAlert size={22} />} 
               label="גבאי" 
               href="/gabbai" 
               active={isActive("/gabbai")}
               color="text-amber-600"
             />
          )}
          
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 w-14 py-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={22} />
            <span className="text-[10px] font-medium">יציאה</span>
          </button>
        </div>

      </div>
    </div>
  );
}

function Tab({ icon, label, href, active, color }: { icon: React.ReactNode, label: string, href: string, active: boolean, color?: string }) {
  const baseColor = color || (active ? "text-blue-600" : "text-slate-400");
  const activeClass = active ? "font-bold" : "";
  
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center gap-1 w-14 py-1 transition-colors ${baseColor} ${activeClass}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}