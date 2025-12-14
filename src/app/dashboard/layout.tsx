import Sidebar from "../components/dashboard/Sidebar";
import ProfilePanel from "../components/dashboard/FamilyPanel";
import { MobileTabs } from "../components/dashboard/MobileTabs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden selection:bg-blue-100 selection:text-blue-900">

      {/* Desktop Sidebar (Right) */}
      <aside className="w-64 bg-white border-l border-slate-200 hidden lg:flex flex-col shadow-sm z-20 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
        <MobileTabs />
      </main>

      {/* Desktop Profile Panel (Left) */}
      <aside className="w-[26rem] bg-white border-r border-slate-200 hidden xl:flex flex-col shadow-sm z-10 flex-shrink-0">
        <ProfilePanel />
      </aside>

    </div>
  );
}
