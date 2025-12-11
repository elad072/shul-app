import "./globals.css";
import { Heebo } from "next/font/google";
import { Viewport } from "next"; // ייבוא חדש לטיפול בתצוגת נייד

// Components
import Sidebar from "./components/dashboard/Sidebar"; 
import ProfilePanel from "./components/dashboard/FamilyPanel"; 
import { MobileTabs } from "./components/dashboard/MobileTabs";

const heebo = Heebo({ 
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-heebo", 
});

// 1. הגדרת המטה-דאטה החדשה
export const metadata = {
  title: "בית הכנסת מעון קודשך - אפליקציה",
  description: "מערכת ניהול קהילה, תפילות ואירועים",
  manifest: "/manifest.json", // אופציונלי לעתיד
  icons: {
    icon: '/logo.png',       // אייקון רגיל לדפדפן
    shortcut: '/logo.png',
    apple: '/logo.png',      // 🔥 חובה בשביל אייפון/אייפד
  },
};

// 2. הגדרת Viewport (כדי שזה ירגיש כמו אפליקציה בנייד - בלי זום מיותר)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-slate-50 text-slate-900 flex h-screen overflow-hidden selection:bg-blue-100 selection:text-blue-900`}>

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

      </body>
    </html>
  );
}
