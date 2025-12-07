import DashboardShell from "@/components/DashboardShell";
import Sidebar from "@/components/Sidebar";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell sidebar={<Sidebar />}>
      {children}
    </DashboardShell>
  );
}
