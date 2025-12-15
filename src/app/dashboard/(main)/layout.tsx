

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { headers } from "next/headers";

import Sidebar from "../../components/dashboard/Sidebar";
import FamilyPanel from "../../components/dashboard/FamilyPanel";
import { MobileTabs } from "../../components/dashboard/MobileTabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  const isFamilyPage = pathname.startsWith("/dashboard/family");

console.log("ENV CHECK", {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY?.slice(0, 10),
});


  const supabase = createServerClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  }
);


  const {
    data: { user },
  } = await supabase.auth.getUser();

  let members: any[] = [];

  if (user && !isFamilyPage) {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: true });

    members = data || [];
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar ימין */}
      <aside className="w-64 bg-white border-l border-slate-200 hidden lg:flex">
        <Sidebar />
      </aside>

      {/* תוכן מרכזי */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto p-6 pb-24">
          {children}
        </div>
        <MobileTabs />
      </main>

      {/* Family Panel – רק אם לא בדף משפחה */}
      {!isFamilyPage && (
        <aside className="hidden xl:flex w-[26rem] bg-white border-r border-slate-200">
          <FamilyPanel members={members} />
        </aside>
      )}
    </div>
  );
}
