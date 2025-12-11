import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "מעון קודשך – מערכת חברי קהילה",
  description: "מערכת ניהול חברי קהילה לבית הכנסת מעון קודשך",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div className="app-shell">
          {/* Sidebar – דסקטופ */}
          <aside className="hidden md:flex w-64 flex-col border-l border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <div className="text-sm text-slate-500">בית הכנסת</div>
                <div className="font-semibold text-slate-900">מעון קודשך</div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
              <NavItem href="/dashboard" label="דשבורד" />
              <NavItem href="/onboarding" label="השלמת פרטים" />
              <NavItem href="/member/edit" label="ניהול משפחה" />
              <NavItem href="/gabbai/approvals" label="פנל גבאי" />
            </nav>

            <div className="px-4 py-4 border-t border-slate-200 text-xs text-slate-500">
              מעון קודשך · מערכת חברי קהילה
            </div>
          </aside>

          {/* חלק מרכזי */}
          <div className="flex flex-1 flex-col min-h-screen">
            {/* Header – מובייל */}
            <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">בית הכנסת</span>
                <span className="text-base font-semibold text-slate-900">
                  מעון קודשך
                </span>
              </div>
              <span className="text-xs text-slate-400">מערכת חברי קהילה</span>
            </header>

            <main className="flex-1 px-3 py-4 md:px-6 md:py-6">
              <div className="mx-auto max-w-5xl">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      <span>{label}</span>
    </Link>
  );
}
