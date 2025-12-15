import Sidebar from "@/app/components/dashboard/Sidebar";
import { MobileTabs } from "@/app/components/dashboard/MobileTabs";

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar – ימין (כמו בדשבורד) */}
      <aside className="w-64 bg-white border-l border-slate-200 hidden lg:flex flex-col shadow-sm z-20 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* תוכן מרכזי – דף משפחה */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 pb-24">
          {children}
        </div>
        <MobileTabs />
      </main>

    </div>
  );
}
