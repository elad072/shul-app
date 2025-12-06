"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ShieldCheck, UserPlus } from "lucide-react";

export default function Sidebar({ profile }: { profile?: any }) {
  const pathname = usePathname();

  const active = (path: string) =>
    pathname.startsWith(path)
      ? "bg-blue-50 text-blue-700"
      : "text-gray-700 hover:bg-gray-100";

  return (
    <div className="flex flex-col w-full py-6 px-4">

      {/* Logo */}
      <div className="text-xl font-bold text-blue-700 mb-6">
        Synagogue CRM
      </div>

      {/* Links */}
      <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-2 rounded-lg ${active("/dashboard")}`}>
        <Home size={18} /> לוח בקרה
      </Link>

      <Link href="/dashboard/members" className={`flex items-center gap-3 px-4 py-2 rounded-lg ${active("/dashboard/members")}`}>
        <Users size={18} /> רשימת חברים
      </Link>

      {profile?.is_gabbai && (
        <Link href="/dashboard/admin/users" className={`flex items-center gap-3 px-4 py-2 rounded-lg ${active("/dashboard/admin")}`}>
          <ShieldCheck size={18} /> ניהול משתמשים
        </Link>
      )}

      <Link href="/dashboard/members/add" className={`flex items-center gap-3 px-4 py-2 rounded-lg ${active("/dashboard/members/add")}`}>
        <UserPlus size={18} /> הוספת חבר חדש
      </Link>

      <div className="flex-1" />
    </div>
  );
}
