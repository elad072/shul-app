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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 pb-safe lg:hidden z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 items-center justify-items-center">
        {/* Item 1: Home */}
        <Tab
          icon={<Home size={22} />}
          label="בית"
          href="/dashboard"
          active={pathname === "/dashboard"}
        />

        {/* Item 2: Events */}
        <Tab
          icon={<Calendar size={22} />}
          label="אירועים"
          href="/dashboard/events"
          active={isActive("/dashboard/events")}
        />

        {/* Item 3: Center (Family) - Special prominent style */}
        <div className="relative -top-3">
          <Link href="/dashboard/family" className="flex flex-col items-center gap-1 group">
            <div className={`p-3.5 rounded-2xl shadow-lg border-2 border-white transition-all active:scale-90 ${isActive("/dashboard/family")
              ? "bg-blue-600 text-white"
              : "bg-slate-900 text-white"
              }`}>
              <Users size={24} />
            </div>
            <span className={`text-[10px] font-bold mt-1.5 transition-colors ${isActive("/dashboard/family") ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              }`}>משפחה</span>
          </Link>
        </div>

        {/* Item 4: Torah Reading */}
        <Tab
          icon={<Book size={22} />}
          label="קריאה"
          href="/dashboard/torah-readings"
          active={isActive("/dashboard/torah-readings")}
        />

        {/* Item 5: Management (Gabbai) or Profile */}
        {isGabbai ? (
          <Tab
            icon={<ShieldAlert size={22} />}
            label="גבאי"
            href="/gabbai"
            active={isActive("/gabbai")}
            color="text-amber-600"
            badge={gabbaiUnread}
          />
        ) : (
          <Tab
            icon={<LogOut size={22} />}
            label="יציאה"
            onClick={handleLogout}
            active={false}
          />
        )}
      </div>
    </div>
  );
}

function Tab({ icon, label, href, active, color, badge, onClick }: {
  icon: React.ReactNode,
  label: string,
  href?: string,
  active: boolean,
  color?: string,
  badge?: number,
  onClick?: () => void
}) {
  const baseColor = color || (active ? "text-blue-600" : "text-slate-400");
  const activeClass = active ? "font-bold" : "";

  const content = (
    <>
      <div className="relative">
        {icon}
        {badge && badge > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white px-0.5">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-medium leading-tight">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 w-full py-1 transition-all active:scale-95 text-slate-400 hover:text-slate-600`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || "#"}
      className={`flex flex-col items-center gap-1 w-full py-1 transition-all active:scale-95 relative ${baseColor} ${activeClass}`}
    >
      {content}
    </Link>
  );
}
