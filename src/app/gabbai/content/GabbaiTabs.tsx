"use client";

import { useState } from "react";
import { 
  Plus, Trash2, Edit2, Clock, MessageSquare, 
  Calendar, X, MapPin, Pin, Megaphone
} from "lucide-react";
import {
  manageAnnouncement, deleteAnnouncement,
  manageEvent, deleteEvent,
  manageSchedule, deleteSchedule,
} from "./actions";

export default function GabbaiTabs({ announcements, events, schedules }: any) {
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
    if (!confirm("האם למחוק?")) return;
    try {
      if (type === "announcement") await deleteAnnouncement(id);
      if (type === "event") await deleteEvent(id);
      if (type === "schedule") await deleteSchedule(id);
    } catch (e) { alert("שגיאה"); }
  };

  const tabs = [
    { id: "schedules", label: "זמנים", icon: <Clock size={18} /> },
    { id: "announcements", label: "מודעות", icon: <MessageSquare size={18} /> },
    { id: "events", label: "אירועים", icon: <Calendar size={18} /> },
  ];

  return (
    <div className="space-y-6 pb-24">
      
      {/* Tabs Navigation - Scrollable on mobile */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">ניהול {tabs.find(t=>t.id===activeTab)?.label}</h2>
        <button onClick={() => openModal()} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-md active:scale-95 text-sm">
          <Plus size={16} /> הוסף חדש
        </button>
      </div>

      {/* Content Lists */}
      <div className="space-y-3">
        {activeTab === "schedules" && schedules.map((s: any) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-xl"><Clock size={18}/></div>
              <div>
                <div className="font-bold text-slate-800">{s.title}</div>
                <div className="text-xs text-slate-500">{s.time_of_day.slice(0,5)} • {s.day_of_week === null ? "כל יום" : ["א","ב","ג","ד","ה","ו","ש"][s.day_of_week]}</div>
              </div>
            </div>
            <Actions onEdit={() => openModal(s)} onDelete={() => handleDelete(s.id, "schedule")} />
          </div>
        ))}

        {activeTab === "announcements" && announcements.map((a: any) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
             {a.is_pinned && <div className="absolute top-0 right-0 w-1.5 h-full bg-orange-400"></div>}
             <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{a.title}</h3>
                <Actions onEdit={() => openModal(a)} onDelete={() => handleDelete(a.id, "announcement")} />
             </div>
             <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 p-2 rounded-lg">{a.content}</p>
          </div>
        ))}

        {activeTab === "events" && events.map((e: any) => (
          <div key={e.id} className="flex bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
             <div className="bg-green-50 text-green-700 w-16 flex flex-col items-center justify-center rounded-xl border border-green-100">
                <span className="text-lg font-bold">{new Date(e.start_time).getDate()}</span>
             </div>
             <div className="flex-1 px-3 py-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate text-sm">{e.title}</h3>
                <div className="text-xs text-slate-500 mt-1">{new Date(e.start_time).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</div>
             </div>
             <div className="flex items-center pl-1 border-l border-slate-100">
                <Actions onEdit={() => openModal(e)} onDelete={() => handleDelete(e.id, "event")} vertical />
             </div>
          </div>
        ))}
      </div>

      {/* --- Responsive Modal (Bottom Sheet on Mobile) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-lg h-[80vh] sm:h-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
               <h3 className="font-bold text-lg text-slate-800">{editingItem ? 'עריכה' : 'הוספה'}</h3>
               <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pb-20">
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

// --- Forms & Actions ---
const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function ScheduleForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageSchedule(fd); onSuccess(); }} className="space-y-4">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="כותרת" name="title" defaultValue={item?.title} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="שעה" name="time_of_day" type="time" defaultValue={item?.time_of_day} required />
        <div>
          <label className="text-xs font-bold text-slate-700">יום</label>
          <select name="day_of_week" defaultValue={item?.day_of_week ?? ""} className="w-full border p-3 rounded-xl bg-slate-50 mt-1"><option value="">כל יום</option>{days.map((d, i) => <option key={i} value={i}>{d}</option>)}</select>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

function AnnouncementForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageAnnouncement(fd); onSuccess(); }} className="space-y-4">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="כותרת" name="title" defaultValue={item?.title} required />
      <div><label className="text-xs font-bold text-slate-700">תוכן</label><textarea name="content" required defaultValue={item?.content} className="w-full border p-3 rounded-xl bg-slate-50 h-32 mt-1" /></div>
      <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-xl"><input type="checkbox" name="is_pinned" defaultChecked={item?.is_pinned} className="w-4 h-4" /><label className="text-sm font-bold text-orange-800">נעוץ</label></div>
      <SubmitButton color="bg-orange-600" />
    </form>
  );
}

function EventForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageEvent(fd); onSuccess(); }} className="space-y-4">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="שם האירוע" name="title" defaultValue={item?.title} required />
      <Input label="מיקום" name="location" defaultValue={item?.location} />
      <Input label="זמן" name="start_time" type="datetime-local" defaultValue={item?.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : ""} required />
      <SubmitButton color="bg-green-600" />
    </form>
  );
}

function Input({ label, ...props }: any) {
  return (<div><label className="text-xs font-bold text-slate-700 block mb-1">{label}</label><input className="w-full border p-3 rounded-xl bg-slate-50" {...props} /></div>);
}

function SubmitButton({ color = "bg-blue-600" }: any) {
  return <button className={`w-full ${color} text-white py-3.5 rounded-xl font-bold shadow-md mt-4`}>שמור</button>;
}

function Actions({ onEdit, onDelete, vertical }: any) {
  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-1`}>
      <button onClick={(e) => {e.stopPropagation(); onEdit()}} className="p-2 text-slate-400 bg-slate-50 rounded-lg"><Edit2 size={16} /></button>
      <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-2 text-slate-400 bg-slate-50 rounded-lg"><Trash2 size={16} /></button>
    </div>
  );
}