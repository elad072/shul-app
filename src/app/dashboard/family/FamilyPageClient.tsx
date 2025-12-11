"use client";

import { useState } from "react";
import { Plus, Gift, Heart, Edit2, Calendar, Trash2, User, Baby } from "lucide-react";
import AddMemberModal from "@/app/components/dashboard/AddMemberModal";
import AddEventModal from "@/app/components/dashboard/AddEventModal";
import { formatGregorianDate, toHebrewNumeral } from "@/lib/hebrewUtils";
import { deleteFamilyEvent } from "@/app/components/dashboard/familyActions";

export default function FamilyPageClient({ members, events }: any) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [eventModalMember, setEventModalMember] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // מיון: הורים בנפרד, ילדים בנפרד
  const parents = members.filter((m: any) => m.role === 'head' || m.role === 'spouse');
  const children = members.filter((m: any) => m.role === 'child');

  const handleEditMember = (member: any) => { setEditingMember(member); setIsMemberModalOpen(true); };
  const handleAddMember = () => { setEditingMember(null); setIsMemberModalOpen(true); };
  const handleAddEvent = (member: any) => { setEditingEvent(null); setEventModalMember(member); };
  const handleEditEvent = (event: any, member: any) => { setEventModalMember(member); setEditingEvent(event); };
  
  const handleDeleteEvent = async (eventId: string) => {
      if (confirm("האם למחוק אירוע זה?")) { await deleteFamilyEvent(eventId); }
  };

  const formatHebrewDate = (day: number, month: string) => `${toHebrewNumeral(day)} ב${month}`;

  // רכיב כרטיס חבר משפחה
  const MemberCard = ({ member, isParent = false }: any) => (
    <div className={`bg-white rounded-2xl border ${isParent ? 'border-blue-100 shadow-md' : 'border-slate-100 shadow-sm'} overflow-hidden hover:shadow-lg transition-all duration-300 group relative`}>
      {/* כותרת הכרטיס */}
      <div className={`p-4 flex items-center gap-4 relative ${isParent ? 'bg-gradient-to-r from-blue-50 to-white' : 'bg-slate-50/50'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm 
          ${member.gender === 'female' ? 'bg-gradient-to-br from-rose-400 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
          {member.first_name?.[0]}
        </div>
        <div>
          <h3 className={`font-bold text-slate-800 ${isParent ? 'text-xl' : 'text-lg'}`}>
            {member.first_name} {member.last_name}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${isParent ? 'bg-white border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`}>
            {member.role === 'head' ? 'ראש משפחה' : (member.role === 'spouse' ? 'בן/בת זוג' : 'ילד/ה')}
          </span>
        </div>
        <button onClick={() => handleEditMember(member)} className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
          <Edit2 size={16} />
        </button>
      </div>

      {/* תוכן הכרטיס */}
      <div className="p-5 space-y-5">
        <div className="flex gap-3 text-sm">
          <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-1">לועזי</p>
            {/* כאן הפורמט המתוקן dd/mm/yyyy */}
            <p className="font-medium text-slate-700 dir-ltr">{formatGregorianDate(member.birth_date)}</p>
          </div>
          <div className="flex-1 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-center">
            <p className="text-xs text-blue-400 mb-1">עברי</p>
            <p className="font-medium text-blue-800">{member.hebrew_birth_date || "-"}</p>
          </div>
        </div>

        {/* אירועים */}
        <div>
           <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">אירועים קרובים</h4>
              <button onClick={() => handleAddEvent(member)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                <Plus size={12} /> הוסף
              </button>
           </div>
           
           <div className="space-y-2">
              {events.filter((e: any) => e.member_id === member.id).length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  אין אירועים רשומים
                </div>
              ) : (
                events.filter((e: any) => e.member_id === member.id).map((ev: any) => (
                  <div key={ev.id} className="flex items-center gap-3 text-xs p-2.5 rounded-lg bg-white border border-slate-100 shadow-sm group/event relative hover:border-blue-200 transition-colors">
                     <div className="p-1.5 rounded-full bg-slate-50">
                       {ev.event_type === 'birthday' && <Gift size={14} className="text-pink-500" />}
                       {ev.event_type === 'anniversary' && <Heart size={14} className="text-rose-500" />}
                       {ev.event_type === 'yahrzeit' && <Calendar size={14} className="text-slate-500" />}
                       {ev.event_type === 'other' && <Calendar size={14} className="text-blue-500" />}
                     </div>
                     <div className="flex-1">
                       <p className="font-semibold text-slate-700">{ev.description}</p>
                       <p className="text-slate-500 text-[11px] mt-0.5">
                         {formatHebrewDate(ev.hebrew_day, ev.hebrew_month)}
                       </p>
                     </div>
                     <div className="flex gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity">
                         <button onClick={() => handleEditEvent(ev, member)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"><Edit2 size={12} /></button>
                         <button onClick={() => handleDeleteEvent(ev.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* כותרת עליונה */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-800">המשפחה שלי</h1>
           <p className="text-slate-500 mt-1">ניהול כרטיסי הורים וילדים</p>
        </div>
        <button onClick={handleAddMember} className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-shadow shadow-md shadow-blue-200">
          <Plus size={20} /> הוסף בן משפחה
        </button>
        {/* כפתור מובייל צף */}
        <button onClick={handleAddMember} className="sm:hidden fixed bottom-20 left-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-300">
          <Plus size={24} />
        </button>
      </div>

      {/* אזור הורים */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <User size={18} />
          <h2 className="text-sm font-bold uppercase tracking-wider">הורים</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parents.map((m: any) => <MemberCard key={m.id} member={m} isParent={true} />)}
          {parents.length === 0 && <p className="text-slate-400">לא נמצאו הורים (הוסף ידנית אם חסר)</p>}
        </div>
      </section>

      {/* אזור ילדים */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Baby size={18} />
          <h2 className="text-sm font-bold uppercase tracking-wider">ילדים</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {children.map((m: any) => <MemberCard key={m.id} member={m} />)}
          {children.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <p className="text-slate-400">עדיין לא הוספת ילדים</p>
              <button onClick={handleAddMember} className="text-blue-600 font-medium mt-2 hover:underline">לחץ כאן להוספה</button>
            </div>
          )}
        </div>
      </section>

      <AddMemberModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} initialData={editingMember} onSuccess={() => {}} />
      <AddEventModal isOpen={!!eventModalMember} onClose={() => { setEventModalMember(null); setEditingEvent(null); }} memberData={eventModalMember} eventData={editingEvent} onSuccess={() => {}} />
    </div>
  );
}
