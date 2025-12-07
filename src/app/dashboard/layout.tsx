import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/utils/supabase/server";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerClientInstance();

  // בדיקת משתמש ב-SSR
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">

      {/* Mobile navbar */}
      <MobileSidebar />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
