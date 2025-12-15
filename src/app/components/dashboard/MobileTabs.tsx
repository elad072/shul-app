"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, LogOut, Calendar } from "lucide-react"; // הוספתי את Calendar
import { createBrowserClient } from "@supabase/ssr";

export function MobileTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/sign-in");
      router.refresh();
    }
  };

  // פונקציה לבדיקה אם הטאב פעיל (כולל תתי-נתיבים)
  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 pb-safe lg:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex justify-between items-end">
        
        {/* קבוצה ימנית */}
        <div className="flex gap-1 w-full justify-start">
          <Tab 
            icon={<Home size={22} />} 
            label="דף הבית" 
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

        {/* כפתור אמצעי בולט - משפחה */}
        <div className="relative -top-6 mx-2 shrink-0">
          <Link href="/dashboard/family">
            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-slate-50 transition-transform active:scale-95 ${
              isActive("/dashboard/family")
                ? "bg-blue-600 text-white" 
                : "bg-slate-900 text-white"
            }`}>
              <Users size={24} />
            </div>
            <span className="text-[10px] font-medium text-slate-500 text-center block mt-1">
              משפחה
            </span>
          </Link>
        </div>

        {/* קבוצה שמאלית */}
        <div className="flex gap-1 w-full justify-end">
          {/* אפשר להוסיף כאן עוד כפתור אם תרצה בעתיד (למשל הודעות גבאי) */}
          
          {/* כפתור יציאה */}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 w-16 py-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={22} />
            <span className="text-[10px] font-medium">יציאה</span>
          </button>
        </div>

      </div>
    </div>
  );
}

// קומפוננטת עזר לכפתורים הרגילים
function Tab({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center gap-1 w-16 py-1 transition-colors ${
        active 
          ? "text-blue-600 font-bold" 
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}