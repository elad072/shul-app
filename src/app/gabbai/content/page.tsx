import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GabbaiTabs from "./GabbaiTabs";

export default async function GabbaiContentPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("is_gabbai").eq("id", user.id).single();
  if (!profile?.is_gabbai) return <div className="p-10 text-center">אין לך הרשאה לצפות בדף זה</div>;

  // שליפת כל הנתונים והעברתם לטאבים
  const { data: announcements } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  const { data: events } = await supabase.from("community_events").select("*").order("start_time", { ascending: true });
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .order("day_of_week", { ascending: true, nullsFirst: true })
    .order("time_of_day", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ניהול תוכן</h1>
        <a href="/dashboard" className="text-sm bg-white border px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50">חזרה</a>
      </div>
      
      <GabbaiTabs 
        announcements={announcements || []} 
        events={events || []} 
        schedules={schedules || []} 
      />
    </div>
  );
}
