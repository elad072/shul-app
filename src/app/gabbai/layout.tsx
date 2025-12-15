import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// וודא שהנתיבים האלו נכונים אצלך (השתמשתי ב-@ כדי שיהיה אוניברסלי)
import Sidebar from "@/app/components/dashboard/Sidebar";
import { MobileTabs } from "@/app/components/dashboard/MobileTabs";

export default async function GabbaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  // 1. יצירת הלקוח
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // התעלמות משגיאות כתיבה ב-Server Component
          }
        },
      },
    }
  );

  // 2. בדיקת משתמש מחובר
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // 3. בדיקת הרשאת גבאי (שכבת הגנה נוספת ברמת ה-Layout)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!profile?.is_gabbai) {
    // אם המשתמש מנסה להיכנס לדף גבאי והוא לא גבאי - נחזיר אותו לדשבורד
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar ימין - קיים בדיוק כמו בדשבורד */}
      <aside className="w-64 bg-white border-l border-slate-200 hidden lg:flex flex-col shadow-sm z-20">
        <Sidebar />
      </aside>

      {/* תוכן מרכזי */}
      <main className="flex-1 overflow-y-auto relative">
        {/* הורדתי את ה-padding הקבוע (pb-24) כאן כדי שדפים פנימיים ישלטו בעיצוב, 
            אבל השארתי את ה-wrapper הכללי */}
        <div className="h-full">
          {children}
        </div>

        {/* תפריט תחתון לנייד */}
        <MobileTabs />
      </main>

      {/* כאן הסרנו את FamilyPanel כי הוא לא רלוונטי לניהול גבאי */}
      
    </div>
  );
}