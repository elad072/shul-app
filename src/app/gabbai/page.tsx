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
  Bell
} from "lucide-react";

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 font-sans">
      
      {/* Header */}
      <header className="mb-10">
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
      </header>

      {/* Grid Menu */}
      <div className="grid md:grid-cols-3 gap-6">
        
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

        {/* 2. ניהול תוכן */}
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

        {/* 3. מחולל הודעות */}
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

      </div>
    </div>
  );
}