import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Bell, Calendar, ChevronLeft, ShieldCheck } from "lucide-react";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 font-sans">
      
      {/* כותרת וברכה */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            שלום, {profile?.first_name || "חבר יקר"} 👋
          </h1>
          <p className="text-slate-500 mt-1">ברוך הבא למערכת הניהול של בית הכנסת</p>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-slate-700">י"א כסלו, תשפ"ד</p>
          <p className="text-xs text-slate-400">פרשת וישלח</p>
        </div>
      </header>

      {/* אזור גבאי (מופיע רק אם יש הרשאה) */}
      {profile?.is_gabbai && (
        <div className="bg-gradient-to-l from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">אזור ניהול גבאים</h3>
              <p className="text-sm text-slate-600">יש לך בקשות משתמשים הממתינות לאישור</p>
            </div>
          </div>
          <a href="/gabbai/approvals" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
            ניהול אישורים
          </a>
        </div>
      )}

      {/* הודעות ועדכונים (במקום הפסים השחורים) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Bell size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold">מה חדש בבית הכנסת?</h2>
        </div>
        
        <div className="grid gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">אירוע קרוב</span>
              <span className="text-xs text-slate-400">לפני שעתיים</span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">מסיבת חנוכה לילדי הקהילה 🍩</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              ביום ראשון נר ראשון של חנוכה תתקיים מסיבה חגיגית לילדים עם הפעלות וסופגניות. כולם מוזמנים!
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold">הודעה חשובה</span>
              <span className="text-xs text-slate-400">אתמול</span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">שינוי זמני תפילה לשבת</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              שימו לב: מנחה של ערב שבת תוקדם ב-10 דקות עקב כניסת השבת המוקדמת.
            </p>
          </div>
        </div>
      </section>

      {/* זמני תפילות */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Calendar size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold">זמני תפילות להיום</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "שחרית", time: "06:30", color: "border-l-4 border-l-orange-400" },
            { name: "מנחה", time: "16:15", color: "border-l-4 border-l-blue-400" },
            { name: "ערבית", time: "17:00", color: "border-l-4 border-l-indigo-400" },
          ].map((item) => (
            <div key={item.name} className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center ${item.color}`}>
              <span className="text-slate-400 text-xs font-medium">תפילת</span>
              <span className="text-xl font-bold text-slate-800">{item.name}</span>
              <span className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
