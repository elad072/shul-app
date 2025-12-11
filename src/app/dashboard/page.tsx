import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Bell, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getCurrentHebrewInfo, formatGregorianDate, toHebrewNumeral } from "@/lib/hebrewUtils";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hebrewInfo = getCurrentHebrewInfo();

  let pendingCount = 0;
  if (profile?.is_gabbai) {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_approval");
      pendingCount = count || 0;
  }

  const { data: upcomingEvents } = await supabase
    .from("personal_events")
    .select("*")
    .eq("created_by", user.id)
    .gte("gregorian_date", new Date().toISOString())
    .order("gregorian_date", { ascending: true })
    .limit(3);

  return (
    <div className="space-y-8 font-sans">
      
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            שלום, {profile?.first_name || "חבר יקר"} 👋
          </h1>
          <p className="text-slate-500 mt-1">ברוך הבא למערכת הניהול</p>
        </div>
        
        <div className="text-left hidden sm:flex flex-col items-end bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xl font-bold text-slate-800 text-blue-700 leading-none mb-1">
             {hebrewInfo.dateString}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
             <span className="tracking-wide">{hebrewInfo.gregorianDate}</span>
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
             <span>פרשת {hebrewInfo.parasha}</span>
          </div>
        </div>
      </header>

      {profile?.is_gabbai && (
        <div className={`border p-6 rounded-2xl flex items-center justify-between shadow-sm ${pendingCount > 0 ? "bg-orange-50 border-orange-100" : "bg-green-50 border-green-100"}`}>
          <div className="flex gap-4 items-center">
            <div className={`p-3 rounded-full shadow-sm ${pendingCount > 0 ? "bg-white text-orange-600" : "bg-white text-green-600"}`}>
              {pendingCount > 0 ? <ShieldCheck size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">אזור ניהול גבאים</h3>
              <p className="text-sm text-slate-600">
                {pendingCount > 0 
                  ? `ישנן ${pendingCount} בקשות ממתינות לאישור` 
                  : "אין בקשות חדשות, הכל מעודכן!"}
              </p>
            </div>
          </div>
          <a href="/gabbai/approvals" className={`px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md ${pendingCount > 0 ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200" : "bg-white text-green-700 border border-green-200 hover:bg-green-50"}`}>
            {pendingCount > 0 ? "ניהול אישורים" : "צפייה ברשימה"}
          </a>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Bell size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold">אירועים קרובים במשפחה</h2>
        </div>
        
        {(!upcomingEvents || upcomingEvents.length === 0) ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
                אין אירועים קרובים (הוסף דרך "ניהול משפחה")
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event: any) => (
                <div key={event.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                        {event.event_type === 'birthday' ? 'יום הולדת' : 'אירוע משפחתי'}
                      </span>
                      <span className="text-xs text-slate-400">{formatGregorianDate(event.gregorian_date)}</span>
                   </div>
                   <h3 className="font-bold text-lg text-slate-800">{event.description}</h3>
                   {/* כאן התיקון: שימוש ב-toHebrewNumeral */}
                   <p className="text-sm text-slate-500 mt-1">{toHebrewNumeral(event.hebrew_day)} ב{event.hebrew_month}</p>
                </div>
              ))}
            </div>
        )}
      </section>

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
