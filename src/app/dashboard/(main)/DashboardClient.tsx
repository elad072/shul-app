"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Bell, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Pin, 
  User, 
  BookOpen
} from "lucide-react";

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
  
  const [activeTab, setActiveTab] = useState<"overview" | "prayers" | "board" | "events">("overview");

  return (
    // הוספתי pb-24 כדי שהתפריט התחתון בנייד לא יסתיר את התוכן
    <div className="space-y-6 font-sans pb-24 md:pb-10">

      {/* ===== Hero Section ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 shadow-xl text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="p-1 bg-white/20 backdrop-blur rounded-2xl shrink-0">
              <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm">
                <Image src="/logo.png" alt="לוגו" fill className="object-contain p-1" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                שלום, {profile?.first_name} <span className="animate-pulse">👋</span>
              </h1>
              <p className="text-blue-100 text-xs flex items-center gap-1 opacity-90">
                <Sparkles size={12} /> ברוכים הבאים
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-3 text-center w-full">
            <div className="text-lg font-bold leading-none mb-1">{hebrewInfo.dateString}</div>
            <div className="text-xs text-blue-100 font-medium">פרשת {hebrewInfo.parasha}</div>
          </div>
        </div>
      </div>

      {/* ===== Navigation Tabs (מותאם למובייל - גלילה אופקית) ===== */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur pt-2 pb-2">
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto no-scrollbar shadow-sm">
          <TabButton 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
            icon={<User size={18}/>} 
            label="ראשי" 
          />
          <TabButton 
            active={activeTab === "prayers"} 
            onClick={() => setActiveTab("prayers")} 
            icon={<Clock size={18}/>} 
            label="זמנים" 
          />
          <TabButton 
            active={activeTab === "board"} 
            onClick={() => setActiveTab("board")} 
            icon={<Bell size={18}/>} 
            label="מודעות" 
          />
          <TabButton 
            active={activeTab === "events"} 
            onClick={() => setActiveTab("events")} 
            icon={<Calendar size={18}/>} 
            label="אירועים" 
          />
        </div>
      </div>

      {/* ===== Content Area ===== */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 min-h-[50vh]">
        
        {/* --- Tab 1: Overview --- */}
        {activeTab === "overview" && (
          <div className="space-y-6">
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
                      <div className="text-xs text-slate-400">{new Date(communityEvents[0].start_time).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</div>
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
                        {s.day_of_week === null ? "כל יום" : ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][s.day_of_week]}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-xl">
                      {s.time_of_day.slice(0,5)}
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
               <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">אירועי קהילה</h3>
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

      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
        active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
      }`}
    >
      {icon}
      {label}
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
         <span className="text-[10px] uppercase font-bold">{date.toLocaleString('en-US', {month:'short'})}</span>
       </div>
       <div className="min-w-0">
         <h4 className="font-bold text-slate-800 text-sm truncate">{event.title || event.description}</h4>
         <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            {!isPersonal && <><Clock size={10}/> {date.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</>}
            {!isPersonal && event.location && <span className="truncate">• {event.location}</span>}
         </div>
       </div>
    </div>
  )
}