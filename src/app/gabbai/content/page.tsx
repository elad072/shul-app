import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Image from "next/image";
import {
  Bell,
  Calendar,
  MapPin,
  ChevronLeft,
  Pin,
  Clock,
  Sparkles
} from "lucide-react";

import { getCurrentHebrewInfo, formatGregorianDate } from "@/lib/hebrewUtils";
import Link from "next/link";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hebrewInfo = getCurrentHebrewInfo();

  // שליפת הודעות
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  // שליפת אירועי קהילה
  const { data: communityEvents } = await supabase
    .from("community_events")
    .select("*")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(3);

  // שליפת אירועים אישיים
  const { data: personalEvents } = await supabase
    .from("personal_events")
    .select("*")
    .eq("created_by", user.id)
    .gte("gregorian_date", new Date().toISOString())
    .order("gregorian_date", { ascending: true })
    .limit(3);

  return (
    <div className="space-y-8 font-sans">

      {/* ===== Hero Section ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-8 shadow-xl text-white">
        {/* אלמנטים דקורטיביים ברקע */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 p-2 shadow-inner">
               <div className="relative w-full h-full rounded-xl overflow-hidden bg-white">
                  <Image src="/logo.png" alt="לוגו" fill className="object-contain p-1" />
               </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  שלום, {profile?.first_name}
                </h1>
                <span className="text-2xl animate-pulse">👋</span>
              </div>
              <p className="text-blue-100 font-medium text-sm md:text-base opacity-90 flex items-center gap-2">
                <Sparkles size={14} />
                ברוכים הבאים למעון קודשך
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[180px] text-center md:text-right">
            <div className="text-sm text-blue-100 mb-1 opacity-80">היום בתאריך</div>
            <div className="text-xl font-bold leading-none mb-1">
              {hebrewInfo.dateString}
            </div>
            <div className="text-sm font-medium text-blue-200">
              פרשת {hebrewInfo.parasha}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Grid Layout ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ===== עמודה ימנית: לוח מודעות (רחב יותר) ===== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-lg text-slate-800">
              <span className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Bell size={20} />
              </span>
              לוח מודעות
            </h2>
            {/* אפשר להוסיף כאן לינק ל"כל ההודעות" בעתיד */}
          </div>

          {announcements?.length === 0 ? (
            <EmptyState message="אין הודעות חדשות כרגע" />
          ) : (
            <div className="space-y-4">
              {announcements?.map((a) => (
                <div
                  key={a.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-md ${
                    a.is_pinned
                      ? "bg-gradient-to-l from-orange-50 to-white border-orange-100"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {a.is_pinned && (
                    <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-br-lg font-bold flex items-center gap-1 shadow-sm z-10">
                      <Pin size={10} className="fill-current" /> נעוץ
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <div className={`mt-1 h-10 w-1 rounded-full ${a.is_pinned ? 'bg-orange-400' : 'bg-slate-200 group-hover:bg-blue-400'} transition-colors`}></div>
                    <div>
                       <h3 className="font-bold text-slate-800 text-lg">{a.title}</h3>
                       <div className="text-sm text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                         {a.content}
                       </div>
                       <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                         <Clock size={12} />
                         {new Date(a.created_at).toLocaleDateString('he-IL')}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== עמודה שמאלית: אירועים (צר יותר) ===== */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* קהילה */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-lg text-slate-800">
                <span className="bg-green-100 p-2 rounded-lg text-green-600">
                  <Calendar size={20} />
                </span>
                בקהילה
              </h2>
            </div>

            {communityEvents?.length === 0 ? (
               <EmptyState message="אין אירועי קהילה קרובים" small />
            ) : (
              <div className="space-y-3">
                {communityEvents?.map((ev) => (
                  <div key={ev.id} className="flex bg-white rounded-2xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 flex flex-col items-center justify-center min-w-[70px]">
                      <span className="text-xs font-bold text-red-500 uppercase">
                        {new Date(ev.start_time).toLocaleString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold text-slate-800">
                        {new Date(ev.start_time).getDate()}
                      </span>
                    </div>
                    <div className="pr-4 flex flex-col justify-center">
                      <h4 className="font-bold text-slate-800 line-clamp-1">{ev.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-slate-400" />
                        {ev.location || "בית הכנסת"}
                      </p>
                      <div className="text-xs text-slate-400 mt-1">
                         {new Date(ev.start_time).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* אירועים אישיים */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                 אירועים אישיים
               </h2>
               <Link href="/dashboard/events" className="text-xs text-blue-600 font-medium hover:underline flex items-center">
                 לכל האירועים <ChevronLeft size={12} />
               </Link>
            </div>

            {personalEvents?.length === 0 ? (
               <div className="text-center p-4 border border-dashed border-slate-200 rounded-xl">
                 <p className="text-xs text-slate-400 mb-2">אין אירועים קרובים</p>
                 <Link href="/dashboard/events" className="text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1 rounded-full inline-block">
                   + הוסף אירוע
                 </Link>
               </div>
            ) : (
              <div className="space-y-3">
                {personalEvents?.map((ev) => (
                  <div key={ev.id} className="relative bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
                     <div className={`w-1 h-8 rounded-full ${ev.event_type === 'birthday' ? 'bg-pink-400' : 'bg-indigo-400'}`}></div>
                     <div className="flex-1">
                        <div className="text-xs font-bold text-slate-500 mb-0.5">
                           {formatGregorianDate(ev.gregorian_date)}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">
                           {ev.description || (ev.event_type === 'birthday' ? 'יום הולדת' : 'אירוע')}
                        </h4>
                     </div>
                     <div className="text-lg">
                       {ev.event_type === 'birthday' ? '🎂' : '🎗️'}
                     </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, small }: { message: string, small?: boolean }) {
  return (
    <div className={`bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center ${small ? 'p-6' : 'p-10'}`}>
      <div className="bg-white p-3 rounded-full shadow-sm mb-3">
        <Bell size={20} className="text-slate-300" />
      </div>
      <span className="text-slate-400 text-sm font-medium">{message}</span>
    </div>
  );
}