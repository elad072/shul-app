"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import {
  Bell,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Pin,
  User,
  BookOpen,
  MessageSquare
} from "lucide-react";
import ContactTab from "./ContactTab";

type Props = {
  profile: any;
  hebrewInfo: any;
  announcements: any[];
  communityEvents: any[];
  personalEvents: any[];
  schedules: any[];
};

export default function DashboardClient({
  profile,
  hebrewInfo,
  announcements,
  communityEvents,
  personalEvents,
  schedules
}: Props) {

  const [activeTab, setActiveTab] = useState<"overview" | "prayers" | "board" | "events" | "contact">("overview");
  const [unreadCount, setUnreadCount] = useState(0);

  // We need client-side supabase for the RPC call
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkUnread();
  }, []);

  const checkUnread = async () => {
    const { data } = await supabase.rpc('get_unread_count', { user_uuid: profile.id });
    setUnreadCount(data || 0);
  };

  return (
    // הוספתי pb-24 כדי שהתפריט התחתון בנייד לא יסתיר את התוכן
    <div className="space-y-6 font-sans pb-24 md:pb-10">

      {/* ===== Hero Section ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] p-6 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm">
                  <Image src="/logo.png" alt="לוגו" fill className="object-contain p-1" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                  שלום, {profile?.first_name} <span className="animate-pulse">👋</span>
                </h1>
                <p className="text-blue-100/80 text-sm font-medium flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-300" /> ברוכים הבאים
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold leading-tight text-amber-50">{hebrewInfo.dateString}</div>
              <div className="text-sm text-blue-100/70 font-medium mt-0.5">פרשת {hebrewInfo.parasha}</div>
            </div>
            <div className="h-8 w-[1px] bg-white/20 mx-4"></div>
            <div className="text-center">
              <div className="text-xs text-blue-200 uppercase tracking-wider font-bold">היום</div>
              <div className="font-mono font-bold text-lg">{new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Navigation Tabs ===== */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-lg pt-2 pb-4 -mx-4 px-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-3 md:flex p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm gap-1">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<User size={20} />}
            label="ראשי"
          />
          <TabButton
            active={activeTab === "prayers"}
            onClick={() => setActiveTab("prayers")}
            icon={<Clock size={18} />}
            label="זמנים"
          />
          <TabButton
            active={activeTab === "board"}
            onClick={() => setActiveTab("board")}
            icon={<Bell size={18} />}
            label="מודעות"
          />
          <TabButton
            active={activeTab === "events"}
            onClick={() => setActiveTab("events")}
            icon={<Calendar size={18} />}
            label="אירועים"
          />
          <TabButton
            active={activeTab === "contact"}
            onClick={() => setActiveTab("contact")}
            icon={<MessageSquare size={18} />}
            label="פניות"
            badge={unreadCount > 0 ? unreadCount : undefined}
            className="col-span-2 md:col-span-1" // Make the last tab span 2 cols on mobile to center it or fill row
          />
        </div>
      </div>

      {/* ===== Content Area ===== */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 min-h-[50vh]">

        {/* --- Tab 1: Overview --- */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* התראות פניות */}
            {unreadCount > 0 && (
              <div onClick={() => setActiveTab("contact")} className="bg-blue-600 rounded-3xl p-5 shadow-lg shadow-blue-200 text-white flex items-center justify-between cursor-pointer active:scale-[0.98] transition">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <MessageSquare size={24} className="text-white fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">יש לך {unreadCount} הודעות חדשות</div>
                    <div className="text-blue-100 text-sm">לחץ כאן לצפייה והמשך התכתבות</div>
                  </div>
                </div>
              </div>
            )}

            {/* PayBox Donation Button */}
            <a
              href="https://links.payboxapp.com/kmd902cjLUb"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-[#00A4F3] to-[#0085C4] rounded-3xl p-5 shadow-lg shadow-blue-200 text-white active:scale-[0.98] transition relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-2xl shadow-sm shrink-0">
                    <Image src="/paybox-logo.png" alt="PayBox" width={32} height={32} className="object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    {/* Fallback icon if image fails (using a placeholder or just hiding it) - actually let's use a generic icon if no image */}
                    <span className="text-[#00A4F3] text-2xl font-black leading-none">P</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">תרומה לבית הכנסת</h3>
                    <p className="text-blue-100 text-sm mt-0.5">השימוש ב-PayBox חינם!</p>
                  </div>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </div>
              </div>
            </a>

            {/* זמנים קרובים */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" /> זמני היום
                </h3>
                <button onClick={() => setActiveTab("prayers")} className="text-xs text-blue-600 font-bold">הכל</button>
              </div>
              <div className="space-y-3">
                {schedules.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-slate-600">{s.title}</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">{s.time_of_day.slice(0, 5)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* הודעה אחרונה */}
            {announcements[0] && (
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={18} className="text-orange-500" /> הודעה אחרונה
                  </h3>
                </div>
                <h4 className="font-bold text-slate-700">{announcements[0].title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{announcements[0].content}</p>
              </div>
            )}

            {/* אירוע קרוב */}
            {communityEvents[0] && (
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-green-600" /> אירוע קרוב
                </h3>
                <div className="flex gap-3 items-center">
                  <div className="bg-green-50 rounded-xl p-2 text-center min-w-[50px] border border-green-100">
                    <div className="text-lg font-bold text-green-700">{new Date(communityEvents[0].start_time).getDate()}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">{communityEvents[0].title}</div>
                    <div className="text-xs text-slate-400">{new Date(communityEvents[0].start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Tab 2: Prayers --- */}
        {activeTab === "prayers" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-700">{s.title}</div>
                    <div className="text-xs text-slate-400">
                      {s.day_of_week === null ? "כל יום" : ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][s.day_of_week]}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-xl">
                    {s.time_of_day.slice(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab 3: Board --- */}
        {activeTab === "board" && (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className={`p-5 rounded-3xl border ${a.is_pinned ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-slate-200'} shadow-sm`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 min-w-[32px] h-8 rounded-full flex items-center justify-center ${a.is_pinned ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                    {a.is_pinned ? <Pin size={16} fill="currentColor" /> : <Bell size={16} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{a.title}</h3>
                    <p className="text-slate-600 text-sm mt-1 whitespace-pre-line">{a.content}</p>
                    <div className="text-xs text-slate-400 mt-2">
                      {new Date(a.created_at).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Tab 4: Events --- */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* קהילה */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">אירועי בית הכנסת</h3>
              {communityEvents.map(e => <EventCard key={e.id} event={e} type="community" />)}
              {communityEvents.length === 0 && <p className="text-sm text-slate-400">אין אירועים</p>}
            </div>

            {/* אישי */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">אירועים אישיים</h3>
              {personalEvents.map(e => <EventCard key={e.id} event={e} type="personal" />)}
              {personalEvents.length === 0 && <p className="text-sm text-slate-400">אין אירועים</p>}
            </div>
          </div>
        )}

        {/* --- Tab 5: Contact --- */}
        {activeTab === "contact" && (
          <ContactTab userId={profile.id} onRead={checkUnread} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge, className }: any) {
  return (
    <button
      onClick={onClick}
      className={` ${className || ''} flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden ${active
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-100 ring-2 ring-slate-900 ring-offset-2'
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 bg-transparent'
        }`}
    >
      {badge && (
        <span className="absolute top-2 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-20"></span>
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function EventCard({ event, type }: any) {
  const isPersonal = type === "personal";
  const date = isPersonal ? new Date(event.gregorian_date) : new Date(event.start_time);

  return (
    <div className="flex bg-white rounded-2xl p-3 border border-slate-200 shadow-sm items-center gap-3">
      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${isPersonal ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
        <span className="text-lg font-bold leading-none">{date.getDate()}</span>
        <span className="text-[10px] uppercase font-bold">{date.toLocaleString('en-US', { month: 'short' })}</span>
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-slate-800 text-sm truncate">{event.title || event.description}</h4>
        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
          {!isPersonal && <><Clock size={10} /> {date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</>}
          {!isPersonal && event.location && <span className="truncate">• {event.location}</span>}
        </div>
      </div>
    </div>
  )
}