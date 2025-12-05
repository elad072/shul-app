import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AdminApplicationsTable from "@/components/AdminApplicationsTable";

export default async function ApplicationsPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // redirect handled by middleware normally
    return <div className="p-8">אנא התחבר/י</div>;
  }

  // only gabbai should access — middleware should guard but double-check
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_gabbai, status")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_gabbai) {
    return <div className="p-8">אין הרשאות לצפות בבקשות</div>;
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">בקשות רישום ממתינות</h1>
      {/* @ts-expect-error Server->Client prop */}
      <AdminApplicationsTable applications={applications || []} />
    </div>
  );
}
