"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Users, UserCog, Calendar, ShieldCheck, LogOut, MessageSquare, PenTool, CheckSquare, Home, ShieldAlert, Book } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isGabbai, setIsGabbai] = useState(false); // בדיקת סטטוס גבאי

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [gabbaiUnread, setGabbaiUnread] = useState(0);

  // בדיקת הרשאות וטעינת נתונים
  useEffect(() => {
    async function initSidebar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_gabbai")
          .eq("id", user.id)
          .single();

        if (data?.is_gabbai) {
          setIsGabbai(true);
          // Fetch unread count for Gabbai
          const { data: count } = await supabase.rpc('get_gabbai_unread_count');
          setGabbaiUnread(count || 0);

          // Subscribe to changes (simple poll or realtime - sticking into interval for simplicity or just run once)
          // For now, let's just fetch once.
        }
      }
    }
    initSidebar();

    // Listen for custom event to refresh badge
    const handleRefresh = () => initSidebar();
    window.addEventListener('refresh-sidebar-badges', handleRefresh);

    return () => {
      window.removeEventListener('refresh-sidebar-badges', handleRefresh);
    };
  }, [supabase, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <nav className="flex flex-col h-full bg-white text-slate-600 font-sans shadow-sm">

      {/* אזור הלוגו */}
      <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
        <div className="relative w-20 h-20 mb-3">
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

      {/* תפריט ניווט */}
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
          label="ניהול תוכן וזמנים"
          href="/dashboard/events"
          active={pathname === "/dashboard/events"}
        />

        <SidebarItem
          icon={<Book size={20} />}
          label="קריאת התורה"
          href="/dashboard/torah-readings"
          active={pathname === "/dashboard/torah-readings"}
        />


        {/* תצוגה מותנית לגבאי בלבד */}
        {isGabbai && (
          <>
            <div className="my-3 border-t border-slate-100 mx-2"></div>

            <div className="px-3 text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              ניהול
            </div>

            <SidebarItem
              icon={<ShieldAlert size={20} />}
              label="אזור גבאי"
              href="/gabbai"
              active={pathname === "/gabbai"}
              special
            />
            <SidebarItem
              icon={<UserCog size={20} />}
              label="הגדרות אפליקציה"
              href="/gabbai/settings"
              active={pathname === "/gabbai/settings"}
              special
            />
            <SidebarItem
              icon={<Book size={20} />}
              label="ניהול קריאת התורה"
              href="/gabbai/torah-readings"
              active={pathname === "/gabbai/torah-readings"}
              special
            />
            <SidebarItem
              icon={<MessageSquare size={20} />}
              label="הודעות ופניות"
              href="/gabbai/messages"
              active={pathname === "/gabbai/messages"}
              special
              badge={gabbaiUnread}
            />
          </>
        )}

      </div>

      {/* כפתור יציאה */}
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

// קומפוננטת עזר
function SidebarItem({ icon, label, href, onClick, active = false, danger = false, special = false, badge }: any) {

  // לוגיקה לצבעים
  let activeClass = "";
  let inactiveClass = "";
  let iconColor = "";

  if (danger) {
    inactiveClass = "text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 mt-2";
    iconColor = "text-red-500";
  } else if (special) {
    // עיצוב מיוחד לכפתור גבאי
    activeClass = "bg-amber-50 text-amber-700 shadow-sm border border-amber-200 font-bold";
    inactiveClass = "text-slate-600 hover:bg-amber-50 hover:text-amber-700";
    iconColor = active ? "text-amber-600" : "text-amber-500";
  } else {
    // עיצוב רגיל
    activeClass = "bg-blue-50 text-blue-700 shadow-sm border border-blue-100 font-bold";
    inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
    iconColor = active ? "text-blue-600" : "text-slate-400";
  }

  const baseClasses = `
      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm w-full cursor-pointer relative
      ${active ? activeClass : inactiveClass}
    `;

  const content = (
    <>
      <span className={iconColor}>{icon}</span>
      <span className="flex-1 text-right">{label}</span>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href || "#"} className={baseClasses}>
      {content}
    </Link>
  );
}