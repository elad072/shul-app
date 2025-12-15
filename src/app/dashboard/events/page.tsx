"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Gift,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  Flame, // אייקון ליארצייט אם תרצה, או שנשתמש בקיים
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import AddEventModal from "@/app/components/dashboard/AddEventModal";
import { deleteFamilyEvent } from "@/app/components/dashboard/familyActions";
import {
  toHebrewDateString,
  formatGregorianDate,
} from "@/lib/hebrewUtils";

/* ========================= */
/* Types */
/* ========================= */

type PersonalEvent = {
  id: string;
  event_type: string | null;
  description: string | null;
  gregorian_date: string | null;
};

type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  personal_events: PersonalEvent[];
};

/* ========================= */
/* Page */
/* ========================= */

export default function EventsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [modalMember, setModalMember] = useState<Member | null>(null);
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null);
  const [modalKey, setModalKey] = useState<string>("closed");

  async function loadEvents() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("members")
      .select(`
        id,
        first_name,
        last_name,
        role,
        personal_events (
          id,
          event_type,
          description,
          gregorian_date
        )
      `)
      .eq("created_by", user.id)
      .order("last_name");

    const normalized: Member[] =
      data?.map((m: any) => {
        const events: PersonalEvent[] = (m.personal_events || [])
          .map((e: any) => ({
            id: String(e.id),
            event_type: e.event_type ?? null,
            description: e.description ?? null,
            gregorian_date: e.gregorian_date ?? null,
          }))
          .sort((a, b) => {
            const ta = a.gregorian_date
              ? new Date(a.gregorian_date).getTime()
              : Number.POSITIVE_INFINITY;
            const tb = b.gregorian_date
              ? new Date(b.gregorian_date).getTime()
              : Number.POSITIVE_INFINITY;
            return ta - tb;
          });

        return {
          id: String(m.id),
          first_name: m.first_name ?? null,
          last_name: m.last_name ?? null,
          role: m.role ?? null,
          personal_events: events,
        };
      }) || [];

    setMembers(normalized);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  /* ========================= */
  /* Modal handlers */
  /* ========================= */

  function openAddEvent(member: Member) {
    setEditingEvent(null);
    setModalMember(member);
    setModalKey(`add:${member.id}:${Date.now()}`);
    setIsEventModalOpen(true);
  }

  function openEditEvent(member: Member, ev: PersonalEvent) {
    setEditingEvent(ev);
    setModalMember(member);
    setModalKey(`edit:${member.id}:${ev.id}`);
    setIsEventModalOpen(true);
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("למחוק את האירוע?")) return;
    await deleteFamilyEvent(id);
    loadEvents();
  }

  function closeModal() {
    setIsEventModalOpen(false);
    setModalMember(null);
    setEditingEvent(null);
    setModalKey("closed");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header מעוצב */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-slate-200/60 pb-6 sticky top-0 z-20 pt-2 px-2 md:static md:bg-transparent md:border-none md:p-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              לוח אירועים משפחתי
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              ימי הולדת, ימי נישואין ואירועים חשובים בתאריך עברי ולועזי
            </p>
          </div>
          {/* אייקון קישוט */}
          <div className="hidden md:block p-3 bg-blue-50 text-blue-600 rounded-2xl rotate-3">
            <Calendar size={32} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center py-20 text-slate-400 animate-pulse">
          טוען אירועים...
        </div>
      )}

      {!loading && members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <Sparkles className="text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-600">אין אירועים עדיין</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            זה הזמן להוסיף את ימי ההולדת של בני המשפחה
          </p>
        </div>
      )}

      <div className="space-y-10">
        {members.map((member) => (
          <section key={member.id} className="relative">
            {/* כותרת דביקה למובייל - כדי שנדע במי מדובר */}
            <div className="sticky top-[85px] md:top-0 z-10 bg-slate-50/95 backdrop-blur py-3 mb-3 border-b border-slate-200/50 md:bg-transparent md:border-none md:backdrop-filter-none">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                     member.role === 'head' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {member.first_name?.[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">
                      {member.first_name} {member.last_name}
                    </h2>
                    {member.role === "head" && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        אב המשפחה
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openAddEvent(member)}
                  className="group flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 bg-white border border-slate-200 rounded-full md:rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all active:scale-95"
                  title="הוסף אירוע"
                >
                  <Plus size={18} />
                  <span className="hidden md:inline text-sm font-medium mr-1.5">הוסף</span>
                </button>
              </div>
            </div>

            {/* רשימת הכרטיסים */}
            {member.personal_events.length === 0 ? (
              <div className="text-sm text-slate-400 italic px-2 py-4">
                אין אירועים רשומים ל{member.first_name}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-1">
                {member.personal_events.map((ev, index) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    isNext={index === 0}
                    onEdit={() => openEditEvent(member, ev)}
                    onDelete={() => handleDeleteEvent(ev.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <AddEventModal
        key={modalKey}
        isOpen={isEventModalOpen}
        onClose={closeModal}
        member={modalMember}
        initialData={editingEvent ?? undefined}
        onSuccess={loadEvents}
      />
    </div>
  );
}

/* ========================= */
/* Event Card (Redesigned)   */
/* ========================= */

function EventCard({
  event,
  isNext,
  onEdit,
  onDelete,
}: {
  event: PersonalEvent;
  isNext: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const gregorian = event.gregorian_date
    ? formatGregorianDate(event.gregorian_date)
    : "—";

  const hebrew = event.gregorian_date
    ? toHebrewDateString(event.gregorian_date)
    : "—";

  const type = event.event_type || "other";
  
  // קביעת סגנון לפי סוג אירוע
  const style = getEventStyle(type);

  return (
    <div
      className={`group relative overflow-hidden bg-white rounded-2xl border transition-all duration-300 
      ${isNext 
        ? "border-blue-300 shadow-md shadow-blue-100/50 ring-1 ring-blue-100" 
        : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
      }`}
    >
      {/* פס צבעוני עליון/צדדי */}
      <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${style.barColor}`} />

      <div className="p-4 pl-3 flex items-start gap-4">
        {/* אייקון גדול */}
        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${style.bgColor} ${style.textColor}`}>
           <EventIcon type={type} size={22} />
        </div>

        {/* תוכן מרכזי */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-snug truncate">
                {event.description || typeLabel(type)}
              </h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                 <span className={`${style.textColor}`}>{typeLabel(type)}</span>
                 {isNext && (
                   <span className="bg-blue-600 text-white text-[10px] px-1.5 py-px rounded-md font-normal">
                     בקרוב
                   </span>
                 )}
              </p>
            </div>
            
            {/* כפתורי פעולה - נחשפים בהובר במחשב, תמיד בנייד אם רוצים, פה עשיתי נקי */}
            <div className="flex gap-1 mr-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* אזור התאריכים */}
          <div className="mt-3 flex items-center gap-3 text-sm border-t border-slate-50 pt-3">
             <div className="flex items-center gap-1.5 text-slate-600 font-medium">
               <span className="text-slate-300"><Calendar size={14}/></span>
               {gregorian}
             </div>
             <div className="w-px h-3 bg-slate-200"></div>
             <div className="text-slate-500 text-xs">
               {hebrew}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= */
/* Helpers & Styles */
/* ========================= */

function getEventStyle(type: string) {
  switch(type) {
    case 'birthday':
      return { 
        bgColor: 'bg-rose-50', 
        textColor: 'text-rose-500', 
        barColor: 'bg-rose-400'
      };
    case 'anniversary':
      return { 
        bgColor: 'bg-indigo-50', 
        textColor: 'text-indigo-500', 
        barColor: 'bg-indigo-400' 
      };
    case 'yahrzeit':
      return { 
        bgColor: 'bg-slate-100', 
        textColor: 'text-slate-600', 
        barColor: 'bg-slate-400' 
      };
    default:
      return { 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-500', 
        barColor: 'bg-blue-400' 
      };
  }
}

function typeLabel(type: string) {
  if (type === "birthday") return "יום הולדת";
  if (type === "anniversary") return "יום נישואין";
  if (type === "yahrzeit") return "יארצייט";
  return "אחר";
}

function EventIcon({ type, size = 20 }: { type: string, size?: number }) {
  if (type === "birthday") return <Gift size={size} />;
  if (type === "anniversary") return <Heart size={size} />;
  if (type === "yahrzeit") return <Flame size={size} />;
  return <Clock size={size} />;
}