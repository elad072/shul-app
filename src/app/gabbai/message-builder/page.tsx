import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MessageBuilderClient from "./MessageBuilderClient";



export default async function MessageBuilderPage() {
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
    return <div className="p-10 text-center">אין לך הרשאה לצפות בדף זה</div>;
  }

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id,title,content,created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: events } = await supabase
    .from("community_events")
    .select("id,title,description,location,start_time,created_at")
    .order("start_time", { ascending: true })
    .limit(10);

  const { data: schedules } = await supabase
    .from("schedules")
    .select("id,title,day_of_week,time_of_day,type,created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans pb-24">
      <MessageBuilderClient
        announcements={announcements || []}
        events={events || []}
        schedules={schedules || []}
      />
    </div>
  );
}
