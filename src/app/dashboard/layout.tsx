import DashboardShell from "@/components/DashboardShell";
import Sidebar from "@/components/Sidebar";
import { createServerClientInstance } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <DashboardShell sidebar={<Sidebar />}>{children}</DashboardShell>;
}
