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

  // 1. נתוני פרופיל
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hebrewInfo = getCurrentHebrewInfo();

  // 2. הודעות
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. אירועי קהילה
  const { data: communityEvents } = await supabase
    .from("community_events")
    .select("*")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  // 4. אירועים אישיים
  const { data: personalEvents } = await supabase
    .from("personal_events")
    .select("*")
    .eq("created_by", user.id)
    .gte("gregorian_date", new Date().toISOString())
    .order("gregorian_date", { ascending: true })
    .limit(5);

  // 5. זמני תפילה (החלק שחסר לך)
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .order("time_of_day", { ascending: true });

  // 6. שליחת הכל לקומפוננטת הלקוח
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