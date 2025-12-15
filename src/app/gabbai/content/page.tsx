import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GabbaiTabs from "./GabbaiTabs";



export default async function GabbaiContentPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!profile?.is_gabbai) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">
          <h2 className="font-bold text-lg text-slate-800 mb-2">
            אין הרשאה
          </h2>
          <p className="text-slate-500 text-sm">
            אין לך הרשאה לצפות בדף זה
          </p>
        </div>
      </div>
    );
  }

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: events } = await supabase
    .from("community_events")
    .select("*")
    .order("start_time", { ascending: true });

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .order("day_of_week", { ascending: true, nullsFirst: true })
    .order("time_of_day", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400 mb-3">
        דשבורד / ניהול גבאים
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-l from-slate-100 via-white to-white p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              ניהול תוכן הקהילה
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl">
              ניהול הודעות, אירועים וזמני תפילות עבור חברי הקהילה
            </p>
          </div>

          
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border shadow-sm p-4 md:p-6">
        <GabbaiTabs
          announcements={announcements || []}
          events={events || []}
          schedules={schedules || []}
        />
      </div>
    </div>
  );
}
