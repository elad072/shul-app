import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Bell, Calendar, ShieldCheck, CheckCircle2, Clock, MapPin, BookOpen } from "lucide-react";
import { getCurrentHebrewInfo, formatGregorianDate, toHebrewDateString } from "@/lib/hebrewUtils";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const hebrewInfo = getCurrentHebrewInfo();

  let pendingCount = 0;
  if (profile?.is_gabbai) {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending_approval");
      pendingCount = count || 0;
  }

  // שליפות
  const { data: personalEvents } = await supabase
    .from("personal_events")
    .select("*")
    .eq("created_by", user.id)
    .gte("gregorian_date", new Date().toISOString())
    .order("gregorian_date", { ascending: true })
    .limit(3);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: communityEvents } = await supabase
    .from("community_events")
    .select("*")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(2);

  const today = new Date().getDay();
  const { data: todaysSchedule } = await supabase
    .from("schedules")
    .select("*")
    .or(`day_of_week.eq.${today},day_of_week.is.null`)
    .order("time_of_day", { ascending: true });

  const { data: shabbatSchedule } = await supabase
    .from("schedules")
    .select("*")
    .in("day_of_week", [5, 6])
    .order("day_of_week", { ascending: true })
    .order("time_of_day", { ascending: true });

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  return (
    <div className="space-y-8 font-sans pb-24 md:pb-10">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">שלום, {profile?.first_name} 👋</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">ברוך הבא למערכת הניהול</p>
        </div>
        <div className="w-full md:w-auto bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
          <div className="text-right md:text-left">
             <p className="text-lg font-bold text-slate-800 text-blue-700 leading-none mb-1">{hebrewInfo.dateString}</p>
             <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>{hebrewInfo.gregorianDate}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>פרשת {hebrewInfo.parasha}</span>
             </div>
          </div>
        </div>
      </header>

      {/* אזור גבאי */}
      {profile?.is_gabbai && (
        <div className={`border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${pendingCount > 0 ? "bg-orange-50 border-orange-100" : "bg-green-50 border-green-100"}`}>
          <div className="flex gap-4 items-center">
            <div className={`p-3 rounded-full shadow-sm ${pendingCount > 0 ? "bg-white text-orange-600" : "bg-white text-green-600"}`}>
              {pendingCount > 0 ? <ShieldCheck size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">אזור ניהול גבאים</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {pendingCount > 0 ? `ישנן ${pendingCount} בקשות ממתינות` : "אין בקשות חדשות"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <a href="/gabbai/approvals" className="flex-1 sm:flex-none text-center bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">אישורים</a>
             <a href="/gabbai/content" className="flex-1 sm:flex-none text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">ניהול תוכן</a>
          </div>
        </div>
      )}

      {/* הודעות קהילה */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-slate-800 px-1">
          <Bell size={18} className="text-blue-600" />
          <h2 className="text-lg font-bold">לוח מודעות</h2>
        </div>
        <div className="grid gap-3">
          {announcements?.length === 0 && <p className="text-slate-400 text-sm px-1">אין הודעות חדשות</p>}
          {announcements?.map((msg) => (
            <div key={msg.id} className={`p-4 rounded-xl border shadow-sm transition-shadow ${msg.is_pinned ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-start mb-2">
                {msg.is_pinned && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">נעוץ</span>}
                {/* --- תאריך עדכון/יצירה של ההודעה --- */}
                <span className="text-[10px] text-slate-400 mr-auto flex gap-1">
                    <span>{new Date(msg.created_at).toLocaleDateString('he-IL')}</span>
                    <span className="opacity-50">|</span>
                    <span>{toHebrewDateString(msg.created_at)}</span>
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-800">{msg.title}</h3>
              <p className="text-slate-600 mt-1 text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* זמני תפילות */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 px-1">
              <Clock size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold">לוח זמנים</h2>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-sm text-slate-600">
                    היום ({days[today]})
                </div>
                <div className="p-2 space-y-1">
                    {todaysSchedule?.length === 0 && <p className="text-center text-slate-400 text-xs py-4">אין זמנים להיום</p>}
                    {todaysSchedule?.map((s) => (
                        <div key={s.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                {s.type === 'class' && <BookOpen size={14} className="text-orange-500" />}
                                {s.title}
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-bold font-mono">{s.time_of_day.slice(0,5)}</span>
                        </div>
                    ))}
                </div>

                {today !== 6 && (
                    <>
                        <div className="bg-slate-50 px-4 py-2 border-y border-slate-200 font-bold text-sm text-slate-600 mt-2">
                            זמני שבת קודש
                        </div>
                        <div className="p-2 space-y-1">
                            {shabbatSchedule?.length === 0 && <p className="text-center text-slate-400 text-xs py-4">טרם עודכנו זמני שבת</p>}
                            {shabbatSchedule?.map((s) => (
                                <div key={s.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <span className="text-xs text-slate-400 w-10">{days[s.day_of_week]}</span>
                                        {s.title}
                                    </span>
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-sm font-bold font-mono">{s.time_of_day.slice(0,5)}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
          </section>

          {/* אירועים */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 px-1">
              <Calendar size={18} className="text-green-600" />
              <h2 className="text-lg font-bold">אירועים קרובים</h2>
            </div>
            
            <div className="space-y-3">
               {/* אירועי קהילה - עם תאריך עברי */}
               {communityEvents?.map((ev) => (
                 <div key={ev.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3">
                    <div className="bg-green-50 text-green-700 p-2 rounded-lg text-center min-w-[50px] flex flex-col justify-center">
                       <span className="text-base font-bold leading-none">{new Date(ev.start_time).getDate()}</span>
                       <span className="text-[10px]">{new Date(ev.start_time).toLocaleString('he-IL', { month: 'short' })}</span>
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-800 text-sm">{ev.title}</h4>
                       <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                         <MapPin size={10} /> {ev.location || 'בית הכנסת'} | {new Date(ev.start_time).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
                       </p>
                       {/* כאן הוספתי את התאריך העברי לאירוע */}
                       <p className="text-[10px] text-green-600 mt-1 font-medium">
                           {toHebrewDateString(ev.start_time)}
                       </p>
                    </div>
                 </div>
               ))}

               {personalEvents?.map((event: any) => (
                <div key={event.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                   <div>
                       <span className="text-[10px] font-bold text-blue-600 block mb-0.5">
                         {event.event_type === 'birthday' ? 'יום הולדת' : 'שמחה משפחתית'}
                       </span>
                       <h3 className="font-bold text-slate-700 text-sm">{event.description}</h3>
                   </div>
                   <div className="text-left">
                       <span className="text-xs font-bold text-slate-700 block">{formatGregorianDate(event.gregorian_date)}</span>
                   </div>
                </div>
              ))}
              
              {communityEvents?.length === 0 && personalEvents?.length === 0 && (
                  <p className="text-slate-400 text-sm px-1">אין אירועים קרובים</p>
              )}
            </div>
          </section>
      </div>
    </div>
  );
}
