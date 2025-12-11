import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import FamilyPageClient from "./FamilyPageClient";

export default async function FamilyPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>נא להתחבר</div>;

  // שליפת חברים (כולל אבא)
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("created_by", user.id)
    .order("birth_date", { ascending: true });

  // שליפת אירועים
  const { data: events } = await supabase
    .from("personal_events")
    .select("*")
    .eq("created_by", user.id)
    .order("gregorian_date", { ascending: true });

  return <FamilyPageClient members={members || []} events={events || []} />;
}
