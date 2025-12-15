"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  User, 
  Baby, 
  Gift, 
  Heart, 
  Clock 
} from "lucide-react";

import AddMemberModal from "@/app/components/dashboard/AddMemberModal";
import AddEventModal from "@/app/components/dashboard/AddEventModal";
import {
  getFamilyMembers,
  deleteFamilyMember,
} from "@/app/components/dashboard/familyActions";

export default function FamilyClient({
  initialMembers,
}: {
  initialMembers: any[];
}) {
  const [members, setMembers] = useState(initialMembers);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventMember, setEventMember] = useState<any>(null);

  async function refresh() {
    const data = await getFamilyMembers();
    setMembers(data || []);
  }

  const parents = members.filter(
    (m) => m.role === "head" || m.role === "spouse"
  );
  const children = members.filter((m) => m.role === "child");

  return (
    <div className="space-y-12 pb-10">

      {/* Header עם רקע עדין */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-3xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">המשפחה שלי</h1>
          <p className="text-slate-500 mt-1">
            כאן מנהלים את פרופיל בני המשפחה, ימי הולדת ואירועים אישיים
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMember(null);
            setMemberModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          הוסף בן משפחה
        </button>
      </div>

      {/* Parents Section */}
      <Section
        title="הורים"
        description="אב ואם המשפחה"
        icon={<User size={20} className="text-blue-500" />}
        members={parents}
        color="blue"
        allowDelete={(m) => m.role !== "head"}
        onAddEvent={(m) => {
          setEventMember(m);
          setEventModalOpen(true);
        }}
        onEdit={(m) => {
          setEditingMember(m);
          setMemberModalOpen(true);
        }}
        onDelete={async (m) => {
          if (!confirm(`למחוק את ${m.first_name}?`)) return;
          await deleteFamilyMember(m.id);
          refresh();
        }}
      />

      {/* Children Section */}
      <Section
        title="ילדים"
        description="ניהול הילדים (ניתן להוסיף ימי הולדת)"
        icon={<Baby size={20} className="text-green-500" />}
        members={children}
        color="green"
        allowDelete={() => true}
        empty="עדיין לא הוספתם ילדים לרשימה"
        onAddEvent={(m) => {
          setEventMember(m);
          setEventModalOpen(true);
        }}
        onEdit={(m) => {
          setEditingMember(m);
          setMemberModalOpen(true);
        }}
        onDelete={async (m) => {
          if (!confirm(`למחוק את ${m.first_name}?`)) return;
          await deleteFamilyMember(m.id);
          refresh();
        }}
      />

      {/* Modals */}
      <AddMemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        initialData={editingMember}
        onSuccess={refresh}
      />

      <AddEventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        member={eventMember}
        onSuccess={refresh}
      />
    </div>
  );
}

/* ---------------- Section & Components ---------------- */

function Section({
  title,
  description,
  icon,
  members,
  allowDelete,
  onEdit,
  onDelete,
  onAddEvent,
  empty,
  color = "blue"
}: any) {
  
  // הגדרת צבעים דינמית
  const theme = color === "blue" 
    ? { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", avatar: "bg-blue-100 text-blue-600" }
    : { bg: "bg-green-50", border: "border-green-100", text: "text-green-700", avatar: "bg-green-100 text-green-600" };

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className={`p-2 rounded-xl ${theme.bg}`}>
           {icon}
        </div>
        <div>
           <h2 className="text-lg font-bold text-slate-800">{title}</h2>
           <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>

      {members.length === 0 && empty ? (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center">
          <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
             <Baby size={24} className="text-slate-300" />
          </div>
          <span className="text-slate-500 font-medium">{empty}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m: any) => (
            <div 
              key={m.id} 
              className="group relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
            >
              {/* Header Card */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${theme.avatar}`}>
                    {m.first_name?.[0]}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-800 leading-tight">
                       {m.first_name}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-0.5">
                       {getRoleLabel(m.role)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(m)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition">
                     <Edit2 size={16} />
                  </button>
                  {allowDelete(m) && (
                    <button onClick={() => onDelete(m)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <InfoBox label="לועזי" value={m.birth_date} />
                <InfoBox label="עברי" value={m.hebrew_birth_date} highlight />
              </div>

              {/* Events List - גדל למלא את המקום */}
              <div className="flex-1 space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                   <Calendar size={12} />
                   אירועים קרובים
                </div>
                
                {(m.personal_events || []).length === 0 ? (
                   <div className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-3 text-center">
                     אין אירועים רשומים
                   </div>
                ) : (
                   (m.personal_events || []).map((e: any) => (
                     <div key={e.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-xl transition hover:bg-white hover:shadow-sm">
                        <EventIcon type={e.event_type} />
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-bold text-slate-700 truncate">
                             {e.description || getEventTypeLabel(e.event_type)}
                           </div>
                           <div className="text-[10px] text-slate-500 font-medium">
                             {new Date(e.gregorian_date).toLocaleDateString('he-IL')}
                           </div>
                        </div>
                     </div>
                   ))
                )}
              </div>

              {/* Add Event Button */}
              <button
                onClick={() => onAddEvent(m)}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-xl py-2.5 text-sm font-bold transition-colors mt-auto"
              >
                <Plus size={16} />
                הוסף אירוע
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function InfoBox({ label, value, highlight }: any) {
  return (
    <div className={`p-3 rounded-2xl border text-center ${highlight ? "bg-blue-50/50 border-blue-100" : "bg-slate-50/50 border-slate-100"}`}>
      <div className="text-[10px] text-slate-400 mb-1">{label}</div>
      <div className={`font-bold text-sm ${highlight ? "text-blue-700" : "text-slate-700"}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  if (type === "birthday") return <div className="p-1.5 bg-pink-100 text-pink-500 rounded-lg"><Gift size={14} /></div>;
  if (type === "anniversary") return <div className="p-1.5 bg-red-100 text-red-500 rounded-lg"><Heart size={14} /></div>;
  return <div className="p-1.5 bg-slate-200 text-slate-500 rounded-lg"><Clock size={14} /></div>;
}

function getRoleLabel(role: string) {
  if (role === 'head') return 'אב משפחה';
  if (role === 'spouse') return 'בן / בת זוג';
  if (role === 'child') return 'ילד / ילדה';
  return role;
}

function getEventTypeLabel(type: string) {
  if (type === 'birthday') return 'יום הולדת';
  if (type === 'anniversary') return 'יום נישואין';
  return 'אירוע';
}