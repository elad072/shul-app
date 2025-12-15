"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Clock, 
  MessageSquare, 
  Calendar, 
  X, 
  Pin,
  MapPin,
  Megaphone
} from "lucide-react";
import {
  manageAnnouncement,
  deleteAnnouncement,
  manageEvent,
  deleteEvent,
  manageSchedule,
  deleteSchedule,
} from "./actions";

export default function GabbaiTabs({
  announcements,
  events,
  schedules,
}: any) {
  const [activeTab, setActiveTab] = useState<"schedules" | "announcements" | "events">("schedules");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק?")) return;
    try {
      if (type === "announcement") await deleteAnnouncement(id);
      if (type === "event") await deleteEvent(id);
      if (type === "schedule") await deleteSchedule(id);
    } catch (e) {
      alert("שגיאה במחיקה");
    }
  };

  const tabs = [
    { id: "schedules", label: "זמני תפילה", icon: <Clock size={18} /> },
    { id: "announcements", label: "לוח מודעות", icon: <MessageSquare size={18} /> },
    { id: "events", label: "אירועים", icon: <Calendar size={18} /> },
  ];

  return (
    <div className="space-y-6">
      
      {/* --- סרגל טאבים --- */}
      <div className="bg-white p-1.5 rounded-2xl flex gap-1 shadow-sm border border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-100 text-blue-600 shadow-inner"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- כפתור הוספה --- */}
      <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
        <h2 className="font-bold text-blue-900">
           רשימת {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>הוסף חדש</span>
        </button>
      </div>

      {/* --- רשימות תוכן --- */}
      <div className="min-h-[300px]">
        
        {/* רשימת זמנים */}
        {activeTab === "schedules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((s: any) => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{s.title}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                       <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{s.time_of_day.slice(0, 5)}</span>
                       <span className="text-slate-300">•</span>
                       <span>{s.day_of_week === null ? "כל יום" : days[s.day_of_week]}</span>
                    </div>
                  </div>
                </div>
                <Actions onEdit={() => openModal(s)} onDelete={() => handleDelete(s.id, "schedule")} />
              </div>
            ))}
            {schedules.length === 0 && <EmptyState text="לא הוגדרו זמני תפילה" />}
          </div>
        )}

        {/* רשימת הודעות */}
        {activeTab === "announcements" && (
          <div className="space-y-4">
            {announcements.map((a: any) => (
              <div key={a.id} className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${a.is_pinned ? 'border-orange-200 bg-orange-50/10' : 'border-slate-200'}`}>
                {a.is_pinned && (
                  <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 px-3 py-1 rounded-bl-2xl text-xs font-bold flex items-center gap-1">
                    <Pin size={12} fill="currentColor" /> נעוץ
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${a.is_pinned ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Megaphone size={20} />
                      </div>
                      <h3 className="font-bold text-xl text-slate-800">{a.title}</h3>
                   </div>
                   <div className="pl-2">
                     <Actions onEdit={() => openModal(a)} onDelete={() => handleDelete(a.id, "announcement")} />
                   </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm whitespace-pre-wrap leading-relaxed border border-slate-100">
                  {a.content}
                </div>
                <div className="text-xs text-slate-400 mt-3 flex justify-end">
                   פורסם בתאריך: {new Date(a.created_at).toLocaleDateString('he-IL')}
                </div>
              </div>
            ))}
            {announcements.length === 0 && <EmptyState text="אין הודעות בלוח" />}
          </div>
        )}

        {/* רשימת אירועים */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 gap-3">
            {events.map((e: any) => {
              const date = new Date(e.start_time);
              return (
                <div key={e.id} className="flex bg-white border border-slate-200 rounded-2xl p-2 shadow-sm hover:shadow-md transition-all">
                  <div className="bg-green-50 text-green-700 w-24 flex flex-col items-center justify-center rounded-xl py-2 border border-green-100">
                     <span className="text-2xl font-bold leading-none">{date.getDate()}</span>
                     <span className="text-xs font-bold uppercase mt-1">{date.toLocaleString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                     <h3 className="font-bold text-lg text-slate-800 truncate">{e.title}</h3>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock size={14}/> {date.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</span>
                        {e.location && <span className="flex items-center gap-1.5"><MapPin size={14}/> {e.location}</span>}
                     </div>
                  </div>
                  <div className="flex items-center px-4 border-r border-slate-100">
                     <Actions onEdit={() => openModal(e)} onDelete={() => handleDelete(e.id, "event")} vertical />
                  </div>
                </div>
              )
            })}
            {events.length === 0 && <EmptyState text="אין אירועים קרובים" />}
          </div>
        )}
      </div>

      {/* --- מודאל (חלון קופץ) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur sticky top-0 z-10">
               <h3 className="font-bold text-xl text-slate-800">{editingItem ? 'עריכת פריט' : 'הוספת פריט חדש'}</h3>
               <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"><X size={20} /></button>
            </div>
            <div className="p-6">
              {activeTab === "schedules" && <ScheduleForm item={editingItem} onSuccess={closeModal} />}
              {activeTab === "announcements" && <AnnouncementForm item={editingItem} onSuccess={closeModal} />}
              {activeTab === "events" && <EventForm item={editingItem} onSuccess={closeModal} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- רכיבי עזר וטפסים ---

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function ScheduleForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageSchedule(fd); onSuccess(); }} className="space-y-5">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="שם התפילה / שיעור" name="title" defaultValue={item?.title} required placeholder="למשל: תפילת שחרית" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="שעה" name="time_of_day" type="time" defaultValue={item?.time_of_day} required />
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">יום</label>
          <select name="day_of_week" defaultValue={item?.day_of_week ?? ""} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="">כל יום</option>
            {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

function AnnouncementForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageAnnouncement(fd); onSuccess(); }} className="space-y-5">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="כותרת ההודעה" name="title" defaultValue={item?.title} required placeholder="נושא ההודעה" />
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">תוכן ההודעה</label>
        <textarea name="content" required defaultValue={item?.content} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none focus:bg-white transition-all" placeholder="כתוב כאן את פרטי ההודעה..." />
      </div>
      <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 cursor-pointer">
        <input type="checkbox" name="is_pinned" id="pinned" defaultChecked={item?.is_pinned} className="w-5 h-5 text-orange-600 rounded cursor-pointer" />
        <label htmlFor="pinned" className="text-sm font-bold text-orange-800 cursor-pointer">נעץ הודעה בראש הלוח</label>
      </div>
      <SubmitButton label="פרסם הודעה" color="bg-orange-600 hover:bg-orange-700" />
    </form>
  );
}

function EventForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageEvent(fd); onSuccess(); }} className="space-y-5">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="שם האירוע" name="title" defaultValue={item?.title} required placeholder="למשל: מסיבת חנוכה" />
      <Input label="מיקום" name="location" defaultValue={item?.location} placeholder="למשל: אולם ראשי" />
      <Input label="תאריך ושעה" name="start_time" type="datetime-local" defaultValue={item?.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : ""} required />
      <SubmitButton label="שמור אירוע" color="bg-green-600 hover:bg-green-700" />
    </form>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <input className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" {...props} />
    </div>
  );
}

function SubmitButton({ label = "שמור שינויים", color = "bg-blue-600 hover:bg-blue-700" }: any) {
  return <button className={`w-full ${color} text-white py-4 rounded-xl font-bold shadow-lg shadow-black/5 mt-4 hover:shadow-xl transition-all active:scale-[0.98]`}>{label}</button>;
}

function Actions({ onEdit, onDelete, vertical }: any) {
  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-2`}>
      <button onClick={(e) => {e.stopPropagation(); onEdit()}} className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors" title="ערוך"><Edit2 size={18} /></button>
      <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-2.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-xl transition-colors" title="מחק"><Trash2 size={18} /></button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
      <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm">
         <Clock className="text-slate-300" />
      </div>
      <p className="text-slate-400 font-medium">{text}</p>
    </div>
  );
}