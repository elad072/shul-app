import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GabbaiTabs from "./GabbaiTabs";
import { ArrowRight } from "lucide-react";

export default async function GabbaiContentPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // וידוא הרשאות גבאי
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!profile?.is_gabbai) {
    redirect("/dashboard");
  }

  // 1. שליפת הודעות
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false }) // קודם נעוצים
    .order("created_at", { ascending: false });

  // 2. שליפת אירועים
  const { data: events } = await supabase
    .from("community_events")
    .select("*")
    .order("start_time", { ascending: true });

  // 3. שליפת זמני תפילה
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .order("time_of_day", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 font-sans">

      <div className="mb-6">
        <a href="/gabbai" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowRight size={16} className="ml-1" />
          חזרה לדשבורד
        </a>
      </div>

      {/* כותרת הדף */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ניהול תוכן וזמנים</h1>
          <p className="text-slate-500 mt-1">עריכת זמני התפילה, לוח המודעות ואירועי הקהילה</p>
        </div>
      </div>

      {/* הקומפוננטה הראשית עם הטאבים */}
      <GabbaiTabs
        announcements={announcements || []}
        events={events || []}
        schedules={schedules || []}
      />
    </div>
  );
}