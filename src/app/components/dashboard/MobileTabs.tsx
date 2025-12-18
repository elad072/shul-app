"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, LogOut, Calendar, ShieldAlert, Book } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

export function MobileTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [isGabbai, setIsGabbai] = useState(false);
  const [gabbaiUnread, setGabbaiUnread] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // פונקציה לבדיקת הרשאות
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsGabbai(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_gabbai")
        .eq("id", user.id)
        .maybeSingle(); // Switch to maybeSingle to avoid error on 0 rows

      if (error) {
        // Ignore "Row not found" which is expected for new users / deleted profiles
        if (error.code !== 'PGRST116') {
          console.error("MobileTabs Profile Check Error:", error);
        }
      }

      if (data?.is_gabbai) {
        setIsGabbai(true);
        // Fetch unread count
        const { data: count, error: countError } = await supabase.rpc('get_gabbai_unread_count');
        if (!countError) {
          setGabbaiUnread(count || 0);
        }
      } else {
        setIsGabbai(false);
      }
    };

    // 1. בדיקה ראשונית
    checkRole();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRole();
    });

    // 3. Listen for custom event
    const handleRefresh = () => checkRole();
    window.addEventListener('refresh-sidebar-badges', handleRefresh);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('refresh-sidebar-badges', handleRefresh);
    };
  }, [supabase, pathname]);

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

          <Tab
            icon={<Book size={22} />}
            label="קריאה"
            href="/dashboard/torah-readings"
            active={isActive("/dashboard/torah-readings")}
          />
        </div>

        {/* כפתור אמצעי - משפחה */}
        <div className="relative -top-6 mx-1 shrink-0">
          <Link href="/dashboard/family">
            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-slate-50 transition-transform active:scale-95 ${isActive("/dashboard/family")
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
              badge={gabbaiUnread}
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

function Tab({ icon, label, href, active, color, badge }: { icon: React.ReactNode, label: string, href: string, active: boolean, color?: string, badge?: number }) {
  const baseColor = color || (active ? "text-blue-600" : "text-slate-400");
  const activeClass = active ? "font-bold" : "";

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 w-14 py-1 transition-colors relative ${baseColor} ${activeClass}`}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 ? (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}