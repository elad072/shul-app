import { createClient } from "@/utils/supabase/server";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_gabbai")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
