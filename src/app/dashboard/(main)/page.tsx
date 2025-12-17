import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCurrentHebrewInfo } from "@/lib/hebrewUtils";
import DashboardClient from "./DashboardClient"; // <--- שים לב לייבוא החדש

export default async function Dashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // 1. נתוני פרופיל (Blocking - we need this for 4)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hebrewInfo = getCurrentHebrewInfo();

  // Parallel Fetching for non-dependent data
  const [
    { data: announcements },
    { data: communityEvents },
    { data: personalEvents },
    { data: schedules }
  ] = await Promise.all([
    // 2. הודעות
    supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),

    // 3. אירועי קהילה
    supabase
      .from("community_events")
      .select("*")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5),

    // 4. אירועים אישיים
    supabase
      .from("personal_events")
      .select("*")
      .eq("created_by", user.id)
      .gte("gregorian_date", new Date().toISOString())
      .order("gregorian_date", { ascending: true })
      .limit(5),

    // 5. זמני תפילה
    supabase
      .from("schedules")
      .select("*")
      .order("time_of_day", { ascending: true })
  ]);
  return (
    <DashboardClient
      profile={profile}
      hebrewInfo={hebrewInfo}
      announcements={announcements || []}
      communityEvents={communityEvents || []}
      personalEvents={personalEvents || []}
      schedules={schedules || []}
    />
  );
}