"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  User,
  Baby,
  Calendar,
  Gift,
  Heart,
} from "lucide-react";

import AddMemberModal from "@/app/components/dashboard/AddMemberModal";
import AddEventModal from "@/app/components/dashboard/AddEventModal";
import {
  getFamilyMembers,
  deleteFamilyMember,
} from "@/app/components/dashboard/familyActions";

export default function FamilyPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // member modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  // event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventMember, setEventMember] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  async function loadMembers() {
    setLoading(true);
    const data = await getFamilyMembers();
    setMembers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const parents = members.filter(
    (m) => m.role === "head" || m.role === "spouse"
  );
  const children = members.filter((m) => m.role === "child");

  /* handlers */

  const handleAddMember = () => {
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setIsMemberModalOpen(true);
  };

  const handleDeleteMember = async (member: any) => {
    if (member.role === "head") return;
    if (!confirm(`למחוק את ${member.first_name}?`)) return;
    await deleteFamilyMember(member.id);
    await loadMembers();
  };

  const handleAddEvent = (member: any) => {
    setEventMember(member);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (member: any, event: any) => {
    setEventMember(member);
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">המשפחה שלי</h1>
          <p className="text-slate-500 mt-1">
            ניהול בני משפחה ואירועים אישיים
          </p>
        </div>

        <button
          onClick={handleAddMember}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          <Plus size={18} />
          הוסף בן משפחה
        </button>
      </div>

      {loading && <div className="text-slate-500">טוען…</div>}

      {/* Parents */}
      <Section
        title="הורים"
        icon={<User size={18} />}
        members={parents}
        allowDelete={(m: any) => m.role !== "head"}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
      />

      {/* Children */}
      <Section
        title="ילדים"
        icon={<Baby size={18} />}
        members={children}
        allowDelete={() => true}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        emptyText="עדיין לא הוספת ילדים"
      />

      {/* Modals */}
      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        initialData={editingMember}
        onSuccess={loadMembers}
      />

      <AddEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        member={eventMember}
        initialData={editingEvent}
        onSuccess={loadMembers}
      />
    </div>
  );
}

/* ========================= */
/* Section */
/* ========================= */

function Section({
  title,
  icon,
  members,
  allowDelete,
  onEdit,
  onDelete,
  onAddEvent,
  onEditEvent,
  emptyText,
}: any) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
      </div>

      {members.length === 0 && emptyText ? (
        <div className="bg-white border border-dashed rounded-2xl p-10 text-center text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m: any) => (
            <MemberCard
              key={m.id}
              member={m}
              allowDelete={allowDelete(m)}
              onEdit={() => onEdit(m)}
              onDelete={() => onDelete(m)}
              onAddEvent={() => onAddEvent(m)}
              onEditEvent={onEditEvent}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ========================= */
/* Member Card + Events */
/* ========================= */

function MemberCard({
  member,
  allowDelete,
  onEdit,
  onDelete,
  onAddEvent,
  onEditEvent,
}: any) {
  const events = member.personal_events || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <div className="text-xl font-bold">{member.first_name}</div>
          <div className="text-sm text-slate-500">
            {member.role === "head"
              ? "אב משפחה"
              : member.role === "spouse"
              ? "בן / בת זוג"
              : "ילד / ילדה"}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onEdit} className="icon-btn">
            <Edit2 size={16} />
          </button>
          {allowDelete && (
            <button onClick={onDelete} className="icon-btn text-red-500">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Birth dates */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoBox label="לועזי" value={member.birth_date} />
        <InfoBox label="עברי" value={member.hebrew_birth_date} blue />
      </div>

      {/* Events */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400">אירועים</div>

        {events.length === 0 ? (
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 text-center">
            אין אירועים
          </div>
        ) : (
          events.map((ev: any) => (
            <div
              key={ev.id}
              className="flex items-center gap-3 p-3 border rounded-xl text-sm"
            >
              <EventIcon type={ev.event_type} />
              <div className="flex-1">
                <div className="font-medium">{ev.description}</div>
                <div className="text-xs text-slate-500">
                  {ev.gregorian_date}
                </div>
              </div>
              <button
                onClick={() => onEditEvent(member, ev)}
                className="text-slate-400 hover:text-blue-600"
              >
                <Edit2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onAddEvent}
        className="w-full flex items-center justify-center gap-2 border rounded-xl py-2 text-sm hover:bg-slate-50"
      >
        <Calendar size={14} />
        הוסף אירוע
      </button>
    </div>
  );
}

/* ========================= */
/* Helpers */
/* ========================= */

function EventIcon({ type }: { type: string }) {
  if (type === "birthday") return <Gift size={16} className="text-pink-500" />;
  if (type === "anniversary") return <Heart size={16} className="text-rose-500" />;
  return <Calendar size={16} className="text-slate-500" />;
}

function InfoBox({ label, value, blue }: any) {
  return (
    <div
      className={`rounded-lg p-3 border text-center ${
        blue ? "bg-blue-50 border-blue-100" : "bg-slate-50"
      }`}
    >
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}
