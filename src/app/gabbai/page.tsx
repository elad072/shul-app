import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  FileText,
  Users,
  ChevronLeft,
  Bell,
  Settings,
  UserCog,
  MessageSquare,
  Book,
  LogOut
} from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";

export default async function GabbaiDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // בדיקת הרשאות
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_gabbai, first_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_gabbai) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">אין גישה</h1>
        <p className="text-slate-500 mt-2">דף זה מיועד לגבאי בית הכנסת בלבד.</p>
        <Link href="/dashboard" className="mt-6 text-blue-600 hover:underline">
          חזרה לדשבורד
        </Link>
      </div>
    );
  }

  // בדיקת כמות ממתינים לאישור (לצורך התראה)
  const { count: pendingCount } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true })
    .eq("status", "pending_approval");

  // בדיקת הודעות שלא נקראו
  const { data: unreadMessages } = await supabase.rpc('get_gabbai_unread_count');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 font-sans">

      {/* Header */}
      <header className="mb-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Link href="/dashboard" className="hover:text-blue-600">דשבורד</Link>
            <span>/</span>
            <span>ניהול גבאי</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            שלום, {profile.first_name} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            מרכז השליטה וניהול בית הכנסת
          </p>
        </div>

        <div className="lg:hidden">
          <LogoutButton variant="outline" className="rounded-2xl border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50" />
        </div>
      </header>

      {/* Grid Menu */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* 1. אישורי משתמשים */}
        <Link href="/gabbai/approvals" className="group relative bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-blue-50 transition-colors">
            <Users size={24} className="text-slate-600 group-hover:text-blue-600" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
              אישורי חברים
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              אישור ודחיית משתמשים חדשים שנרשמו לאפליקציה.
            </p>
          </div>

          {/* Badge אם יש ממתינים */}
          {pendingCount && pendingCount > 0 ? (
            <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 w-fit px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
              <Bell size={14} />
              {pendingCount} ממתינים לאישור
            </div>
          ) : (
            <div className="mt-6 text-green-600 bg-green-50 w-fit px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck size={14} />
              הכל מעודכן
            </div>
          )}
        </Link>

        {/* 2. ניהול משתמשים - החדש */}
        <Link href="/gabbai/users" className="group relative bg-white border border-slate-200 hover:border-purple-300 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-purple-50 transition-colors">
            <Users size={24} className="text-slate-600 group-hover:text-purple-600" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
              ניהול משתמשים
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              צפייה בכל חברי הקהילה, עריכת פרטים, שינוי הרשאות ומחיקת משתמשים.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-1 text-slate-400 text-sm group-hover:translate-x-[-4px] transition-transform">
            <span>לניהול</span>
            <ChevronLeft size={16} />
          </div>
        </Link>

        {/* 3. ניהול תוכן */}
        <Link href="/gabbai/content" className="group relative bg-white border border-slate-200 hover:border-indigo-300 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors">
            <FileText size={24} className="text-slate-600 group-hover:text-indigo-600" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
              ניהול תוכן וזמנים
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              עריכת זמני תפילות, הוספת הודעות ללוח המודעות וניהול אירועי קהילה.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-1 text-slate-400 text-sm group-hover:translate-x-[-4px] transition-transform">
            <span>לניהול</span>
            <ChevronLeft size={16} />
          </div>
        </Link>

        {/* 4. מחולל הודעות */}
        <Link href="/gabbai/message-builder" className="group relative bg-white border border-slate-200 hover:border-green-300 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-green-50 transition-colors">
            <MessageCircle size={24} className="text-slate-600 group-hover:text-green-600" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-700 transition-colors">
              שליחה לווצאפ
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              כתיבת הודעה מעוצבת עם זמני השבוע ושליחה מהירה לקבוצת הווצאפ.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-1 text-slate-400 text-sm group-hover:translate-x-[-4px] transition-transform">
            <span>ליצירת הודעה</span>
            <ChevronLeft size={16} />
          </div>
        </Link>

        {/* 5. ניהול קריאות בתורה - החדש */}
        <Link href="/gabbai/torah-readings" className="group relative bg-white border border-slate-200 hover:border-amber-300 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-amber-50 transition-colors">
            <Book size={24} className="text-slate-600 group-hover:text-amber-600" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
              ניהול קריאת התורה
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              ניהול שיבוצי קוראים, הוספת חברים חדשים ועדכון פרשיות השבוע.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-1 text-slate-400 text-sm group-hover:translate-x-[-4px] transition-transform">
            <span>לניהול השיבוצים</span>
            <ChevronLeft size={16} />
          </div>
        </Link>

        {/* 6. הודעות ופניות */}
        <Link href="/gabbai/messages" className="group relative bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-blue-50 transition-colors">
            <MessageSquare size={24} className="text-slate-600 group-hover:text-blue-600" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
              הודעות ופניות
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              צפייה בפניות חברים, טיפול בבקשות והתכתבות ישירה.
            </p>
          </div>

          {/* Badge להודעות */}
          {unreadMessages && unreadMessages > 0 ? (
            <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 w-fit px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
              <Bell size={14} />
              {unreadMessages} הודעות חדשות
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-1 text-slate-400 text-sm group-hover:translate-x-[-4px] transition-transform">
              <span>לתיבת הדואר</span>
              <ChevronLeft size={16} />
            </div>
          )}
        </Link>

        {/* 6. הגדרות אפליקציה */}
        <Link href="/gabbai/settings" className="group relative bg-white border border-slate-200 hover:border-slate-400 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-slate-100 transition-colors">
            <Settings size={24} className="text-slate-600 group-hover:text-slate-800" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
              הגדרות גבאי
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              ניהול נושאי פניות דינאמיים והגדרות מערכת נוספות.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-1 text-slate-400 text-sm group-hover:translate-x-[-4px] transition-transform">
            <span>להגדרות</span>
            <ChevronLeft size={16} />
          </div>
        </Link>

        {/* 7. בדיקת WhatsApp */}
        <Link href="/gabbai/whatsapp-test" className="group relative bg-white border border-slate-200 hover:border-green-300 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute top-6 left-6 bg-slate-50 p-3 rounded-2xl group-hover:bg-green-50 transition-colors">
            <MessageCircle size={24} className="text-slate-600 group-hover:text-green-600" />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-700 transition-colors">
              בדיקת WhatsApp
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              בדיקת חיבור ל-WhatsApp Cloud API ושליחת הודעת ניסיון.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-1 text-slate-400 text-sm group-hover:translate-x-[-4px] transition-transform">
            <span>לבדיקה</span>
            <ChevronLeft size={16} />
          </div>
        </Link>
      </div>
    </div>
  );
}