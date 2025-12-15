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
  schedules: any[]; // הוספנו את הזמנים
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
    <div className="space-y-6 font-sans pb-10">

      {/* ===== Hero Section (כרטיס כניסה) ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 md:p-8 shadow-xl text-white">
        {/* קישוטים ברקע */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-1 bg-white/20 backdrop-blur rounded-2xl">
              <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden shadow-sm">
                <Image src="/logo.png" alt="לוגו" fill className="object-contain p-1" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                שלום, {profile?.first_name} <span className="animate-pulse">👋</span>
              </h1>
              <p className="text-blue-100 text-sm flex items-center gap-1 opacity-90">
                <Sparkles size={12} /> ברוכים הבאים למעון קודשך
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[160px] text-center">
            <div className="text-2xl font-bold leading-none mb-1">{hebrewInfo.dateString}</div>
            <div className="text-sm text-blue-100 font-medium">פרשת {hebrewInfo.parasha}</div>
          </div>
        </div>
      </div>

      {/* ===== Navigation Tabs (הטאבים שביקשת) ===== */}
      <div className="flex p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
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
          label="זמני תפילה" 
        />
        <TabButton 
          active={activeTab === "board"} 
          onClick={() => setActiveTab("board")} 
          icon={<Bell size={18}/>} 
          label="לוח מודעות" 
        />
        <TabButton 
          active={activeTab === "events"} 
          onClick={() => setActiveTab("events")} 
          icon={<Calendar size={18}/>} 
          label="אירועים" 
        />
      </div>

      {/* ===== Content Area ===== */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* --- Tab 1: Overview (סיכום) --- */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* וידג'ט זמנים קרובים */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <Clock size={24} />
                </div>
                <button onClick={() => setActiveTab("prayers")} className="text-xs font-bold text-blue-600 hover:underline">
                  לכל הזמנים
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">זמני היום</h3>
              <div className="space-y-3">
                {schedules.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-slate-600">{s.title}</span>
                    <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{s.time_of_day.slice(0, 5)}</span>
                  </div>
                ))}
                {schedules.length === 0 && <p className="text-sm text-slate-400">אין זמנים מוגדרים</p>}
              </div>
            </div>

            {/* וידג'ט מודעה אחרונה */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm md:col-span-2 lg:col-span-1 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                 <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
                    <Bell size={24} />
                 </div>
                 <button onClick={() => setActiveTab("board")} className="text-xs font-bold text-blue-600 hover:underline">
                  לכל ההודעות
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">הודעה אחרונה</h3>
              {announcements[0] ? (
                <div>
                   <h4 className="font-bold text-slate-700">{announcements[0].title}</h4>
                   <p className="text-sm text-slate-500 line-clamp-2 mt-1">{announcements[0].content}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">אין הודעות חדשות</p>
              )}
            </div>

            {/* וידג'ט אירוע קרוב */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm md:col-span-2 lg:col-span-1 relative overflow-hidden group hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-4">
                 <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                    <Calendar size={24} />
                 </div>
                 <button onClick={() => setActiveTab("events")} className="text-xs font-bold text-blue-600 hover:underline">
                  לכל האירועים
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">האירוע הבא</h3>
              {communityEvents[0] ? (
                 <div className="bg-slate-50 rounded-xl p-3 flex gap-3 items-center">
                    <div className="bg-white border rounded-lg p-2 text-center min-w-[50px]">
                       <div className="text-xs text-red-500 font-bold uppercase">{new Date(communityEvents[0].start_time).toLocaleString('en-US', {month: 'short'})}</div>
                       <div className="text-lg font-bold text-slate-800">{new Date(communityEvents[0].start_time).getDate()}</div>
                    </div>
                    <div className="truncate">
                       <div className="font-bold text-slate-700 truncate">{communityEvents[0].title}</div>
                       <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={10} /> {communityEvents[0].location || 'בית כנסת'}
                       </div>
                    </div>
                 </div>
              ) : (
                <p className="text-sm text-slate-400">אין אירועים קרובים</p>
              )}
            </div>
          </div>
        )}

        {/* --- Tab 2: Prayers (זמנים) --- */}
        {activeTab === "prayers" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <Clock className="text-blue-600" /> זמני תפילה ושיעורים
               </h2>
             </div>
             <div className="divide-y divide-slate-100">
               {schedules.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">לא עודכנו זמנים במערכת</div>
               ) : (
                 schedules.map((s) => (
                   <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                           <BookOpen size={18} />
                         </div>
                         <div>
                           <div className="font-bold text-slate-700">{s.title}</div>
                           <div className="text-xs text-slate-500">
                             {s.day_of_week === null ? "כל יום" : ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][s.day_of_week]}
                           </div>
                         </div>
                      </div>
                      <div className="text-lg font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl font-mono">
                        {s.time_of_day.slice(0,5)}
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

        {/* --- Tab 3: Board (הודעות) --- */}
        {activeTab === "board" && (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className={`p-6 rounded-3xl border ${a.is_pinned ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-200'} shadow-sm relative overflow-hidden`}>
                 {a.is_pinned && <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${a.is_pinned ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                    {a.is_pinned ? <Pin size={18} fill="currentColor" /> : <Bell size={18} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">{a.title}</h3>
                    <p className="text-slate-600 mt-2 whitespace-pre-line leading-relaxed">{a.content}</p>
                    <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                      <Clock size={12}/> פורסם בתאריך: {new Date(a.created_at).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <EmptyState label="אין הודעות חדשות" />}
          </div>
        )}

        {/* --- Tab 4: Events (אירועים) --- */}
        {activeTab === "events" && (
          <div className="space-y-8">
             {/* אירועי קהילה */}
             <section>
               <h3 className="font-bold text-slate-500 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span> אירועי קהילה
               </h3>
               <div className="grid gap-4 md:grid-cols-2">
                 {communityEvents.length === 0 ? <p className="text-slate-400 text-sm">אין אירועי קהילה</p> : 
                   communityEvents.map(e => <EventCard key={e.id} event={e} type="community" />)
                 }
               </div>
             </section>

             {/* אירועים אישיים */}
             <section>
               <h3 className="font-bold text-slate-500 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-purple-500"></span> אירועים אישיים
               </h3>
               <div className="grid gap-4 md:grid-cols-2">
                 {personalEvents.length === 0 ? <p className="text-slate-400 text-sm">אין אירועים אישיים</p> : 
                   personalEvents.map(e => <EventCard key={e.id} event={e} type="personal" />)
                 }
               </div>
             </section>
          </div>
        )}

      </div>
    </div>
  );
}

// --- Helper Components ---

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
        active ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:bg-slate-200/50'
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
    <div className="flex bg-white rounded-2xl p-4 border border-slate-200 shadow-sm items-center gap-4 hover:shadow-md transition-shadow">
       <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl flex-shrink-0 ${isPersonal ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
         <span className="text-lg font-bold">{date.getDate()}</span>
         <span className="text-[10px] uppercase font-bold">{date.toLocaleString('en-US', {month:'short'})}</span>
       </div>
       <div className="min-w-0">
         <h4 className="font-bold text-slate-800 truncate">{event.title || event.description}</h4>
         <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
            {isPersonal ? (
              <span className="text-purple-500 text-xs font-bold bg-purple-50 px-2 py-0.5 rounded">אישי</span>
            ) : (
               <><Clock size={12}/> {date.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</>
            )}
            {!isPersonal && event.location && <span className="truncate">• {event.location}</span>}
         </div>
       </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
      {label}
    </div>
  )
}