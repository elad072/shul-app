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
  Users,
  Sparkles,
  ChevronLeft
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
    <div className="space-y-6 md:space-y-8 pb-24 md:pb-12 font-sans max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-2xl">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-200 mb-3 border border-white/10">
              <Users size={14} />
              ניהול משפחה
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
              המשפחה שלי
            </h1>
            <p className="text-blue-100/70 text-base md:text-lg max-w-xl leading-relaxed">
              כאן ניתן לנהל את בני המשפחה, לעדכן תאריכי לידה ואירועים אישיים
            </p>
          </div>

          <button
            onClick={handleAddMember}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-900/40 transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>הוספת בן משפחה</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl"></div>)}
        </div>
      ) : (
        <div className="space-y-8 md:space-y-10">

          {/* Parents Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-blue-100/50 rounded-xl text-blue-600">
                <User size={20} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">הורים</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
              {parents.map((m: any) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  isHead={true}
                  allowDelete={m.role !== "head"}
                  onEdit={() => handleEditMember(m)}
                  onDelete={() => handleDeleteMember(m)}
                  onAddEvent={() => handleAddEvent(m)}
                  onEditEvent={handleEditEvent}
                />
              ))}
            </div>
          </div>

          {/* Children Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-amber-100/50 rounded-xl text-amber-600">
                <Baby size={20} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">ילדים</h2>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-bold">{children.length}</span>
            </div>

            {children.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center group hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleAddMember}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Plus size={32} className="text-slate-400 group-hover:text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">עדיין לא הוספת ילדים</h3>
                <p className="text-slate-500 text-sm mt-1">לחץ כאן להוספת ילד/ה לרשימה</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {children.map((m: any) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    isHead={false}
                    allowDelete={true}
                    onEdit={() => handleEditMember(m)}
                    onDelete={() => handleDeleteMember(m)}
                    onAddEvent={() => handleAddEvent(m)}
                    onEditEvent={handleEditEvent}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

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
/* Member Card */
/* ========================= */

function MemberCard({
  member,
  isHead,
  allowDelete,
  onEdit,
  onDelete,
  onAddEvent,
  onEditEvent,
}: any) {
  const events = member.personal_events || [];

  return (
    <div className={`relative group overflow-hidden bg-white border rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 ${isHead ? 'border-blue-100/50 shadow-blue-100/20' : 'border-slate-100'}`}>
      {/* Top Decoration */}
      {isHead && <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>}

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${isHead ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
              {member.first_name[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{member.first_name}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${isHead ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                {member.role === "head" ? "ראש משפחה" : member.role === "spouse" ? "בן/בת זוג" : "ילד/ה"}
              </span>
            </div>
          </div>

          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
              <Edit2 size={18} />
            </button>
            {allowDelete && (
              <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">תאריך לועזי</span>
            <span className="font-bold text-slate-700 dir-ltr">{member.birth_date || "-"}</span>
          </div>
          <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">תאריך עברי</span>
            <span className="font-bold text-blue-700">{member.hebrew_birth_date || "-"}</span>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} /> אירועים קרובים
            </h4>
          </div>

          {events.length === 0 ? (
            <div className="text-sm text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
              אין אירועים
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((ev: any) => (
                <div key={ev.id} className="flex items-center gap-3 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors group/event cursor-default">
                  <div className="shrink-0 bg-slate-50 p-2 rounded-lg">
                    <EventIcon type={ev.event_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-700 text-sm truncate">{ev.description}</div>
                    <div className="text-xs text-slate-400">{ev.gregorian_date}</div>
                  </div>
                  <button
                    onClick={() => onEditEvent(member, ev)}
                    className="text-slate-300 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors opacity-0 group-hover/event:opacity-100"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <button
          onClick={onAddEvent}
          className="w-full py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Calendar size={16} />
          הוספת אירוע
        </button>
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  if (type === "birthday") return <Gift size={16} className="text-pink-500" />;
  if (type === "anniversary") return <Heart size={16} className="text-rose-500" />;
  return <Calendar size={16} className="text-slate-500" />;
}
