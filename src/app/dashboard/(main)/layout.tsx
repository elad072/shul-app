import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import Sidebar from "../../components/dashboard/Sidebar";
import FamilyPanel from "../../components/dashboard/FamilyPanel";
import { MobileTabs } from "../../components/dashboard/MobileTabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // הוספת ה-header הזה דורשת middleware כפי שדיברנו קודם.
  // אם אין לך middleware, ה-isFamilyPage עלול לא לעבוד בצד שרת.
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isFamilyPage = pathname.startsWith("/dashboard/family");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  let members: any[] = [];

  if (!isFamilyPage) {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: true });

    members = data || [];
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]"> {/* צבע רקע טיפה יותר מודרני מ-slate-50 רגיל */}

      {/* Sidebar ימין - קבוע */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-l border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <Sidebar />
      </aside>

      {/* תוכן מרכזי */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32 lg:pb-12">
          {children}
        </div>
        
        {/* תפריט נייד */}
        <MobileTabs />
      </main>

      {/* Family Panel – צד שמאל, רחב יותר ומעוצב */}
      {!isFamilyPage && (
        <aside className="hidden xl:flex flex-col w-80 bg-white border-r border-slate-200/60 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20 overflow-y-auto">
          <FamilyPanel members={members} />
        </aside>
      )}
    </div>
  );
}