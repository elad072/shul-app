"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Gift,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Tag,
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
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">
          אירועים אישיים
        </h1>
        <p className="text-slate-500 mt-1">
          תצוגה לפי בני משפחה · תאריך לועזי ועברי
        </p>
      </header>

      {loading && <div className="text-slate-500">טוען…</div>}

      {!loading && members.length === 0 && (
        <div className="text-slate-400 italic">
          לא נמצאו אירועים
        </div>
      )}

      <div className="space-y-12">
        {members.map((member) => (
          <section key={member.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-700">
                {member.first_name} {member.last_name}
                {member.role === "head" && (
                  <span className="text-xs text-blue-600 mr-2">
                    (אב המשפחה)
                  </span>
                )}
              </h2>

              <button
                onClick={() => openAddEvent(member)}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm hover:bg-slate-50"
              >
                <Plus size={16} />
                הוסף אירוע
              </button>
            </div>

            {member.personal_events.length === 0 ? (
              <div className="bg-slate-50 border border-dashed rounded-2xl p-6 text-center text-slate-400">
                אין אירועים רשומים
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
/* Event Card */
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

  return (
    <div
      className={`relative rounded-2xl border p-5 shadow-sm transition ${
        isNext
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-slate-200"
      }`}
    >
      {/* badge */}
      {isNext && (
        <span className="absolute top-4 left-4 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full pointer-events-none">
          האירוע הקרוב
        </span>
      )}

      {/* actions */}
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <button
          onClick={onEdit}
          className="text-slate-400 hover:text-blue-600"
          title="עריכה"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-600"
          title="מחיקה"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* content */}
      <div className="space-y-4 pr-10">
        {/* title */}
        <div className="flex items-center gap-3">
          <EventIcon type={type} />
          <div className="text-lg font-bold text-slate-800">
            {event.description || typeLabel(type)}
          </div>
        </div>

        {/* type */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Tag size={12} />
          {typeLabel(type)}
        </div>

        {/* dates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={14} />
            <span>{gregorian}</span>
          </div>

          <div className="text-slate-600 text-right">
            ✡ {hebrew}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ========================= */
/* Helpers */
/* ========================= */

function typeLabel(type: string) {
  if (type === "birthday") return "יום הולדת";
  if (type === "anniversary") return "יום נישואין";
  if (type === "yahrzeit") return "יארצייט";
  return "אחר";
}

function EventIcon({ type }: { type: string }) {
  if (type === "birthday") {
    return <Gift size={20} className="text-pink-500" />;
  }
  if (type === "anniversary") {
    return <Heart size={20} className="text-rose-500" />;
  }
  return <Calendar size={20} className="text-slate-500" />;
}
