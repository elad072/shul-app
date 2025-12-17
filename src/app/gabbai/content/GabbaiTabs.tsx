"use client";

import { useState } from "react";
import {
  Plus, Trash2, Edit2, Clock, MessageSquare,
  Calendar, X, MapPin, Pin, Megaphone
} from "lucide-react";
import { toast } from "sonner";
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
    if (!confirm("האם למחוק פריט זה?")) return;
    try {
      if (type === "announcement") await deleteAnnouncement(id);
      if (type === "event") await deleteEvent(id);
      if (type === "schedule") await deleteSchedule(id);
      toast.success("נמחק בהצלחה");
    } catch (e) {
      toast.error("שגיאה במחיקה");
    }
  };

  const tabs = [
    { id: "schedules", label: "זמנים", icon: <Clock size={18} /> },
    { id: "announcements", label: "מודעות", icon: <MessageSquare size={18} /> },
    { id: "events", label: "אירועים", icon: <Calendar size={18} /> },
  ];

  return (
    <div className="space-y-6 pb-24">

      {/* Tabs Navigation */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          ניהול {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-sm"
        >
          <Plus size={18} /> הוסף חדש
        </button>
      </div>

      {/* Content Lists */}
      <div className="space-y-4">
        {activeTab === "schedules" && (
          schedules.length > 0 ? schedules.map((s: any) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Clock size={20} /></div>
                <div>
                  <div className="font-bold text-slate-900 text-lg">{s.title}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{s.time_of_day.slice(0, 5)}</span>
                    <span>•</span>
                    <span>{s.day_of_week === null ? "כל יום" : ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][s.day_of_week]}</span>
                  </div>
                </div>
              </div>
              <Actions onEdit={() => openModal(s)} onDelete={() => handleDelete(s.id, "schedule")} />
            </div>
          )) : <EmptyState text="לא הוגדרו זמנים" />
        )}

        {activeTab === "announcements" && (
          announcements.length > 0 ? announcements.map((a: any) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
              {a.is_pinned && <div className="absolute top-0 right-0 w-1.5 h-full bg-orange-400"></div>}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {a.title}
                  {a.is_pinned && <Pin size={14} className="text-orange-500 rotate-45" />}
                </h3>
                <Actions onEdit={() => openModal(a)} onDelete={() => handleDelete(a.id, "announcement")} />
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{a.content}</p>
            </div>
          )) : <EmptyState text="אין מודעות כרגע" />
        )}

        {activeTab === "events" && (
          events.length > 0 ? events.map((e: any) => (
            <div key={e.id} className="flex bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-50 text-green-700 w-20 flex flex-col items-center justify-center rounded-xl border border-green-100 py-2">
                <span className="text-2xl font-bold">{new Date(e.start_time).getDate()}</span>
                <span className="text-xs font-medium">{new Date(e.start_time).toLocaleString('he-IL', { month: 'short' })}</span>
              </div>
              <div className="flex-1 px-4 py-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 truncate text-lg">{e.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Clock size={14} />
                  {new Date(e.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  {e.location && <span className="flex items-center gap-1 border-r border-slate-300 pr-2 mr-2"><MapPin size={14} /> {e.location}</span>}
                </div>
              </div>
              <div className="flex items-center pl-2 border-l border-slate-100">
                <Actions onEdit={() => openModal(e)} onDelete={() => handleDelete(e.id, "event")} vertical />
              </div>
            </div>
          )) : <EmptyState text="אין אירועים קרובים" />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-lg h-[80vh] sm:h-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-800">{editingItem ? 'עריכת פריט' : 'הוספת פריט חדש'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pb-20 sm:pb-6">
              {activeTab === "schedules" && <ScheduleForm item={editingItem} onSuccess={() => { closeModal(); toast.success("נשמר בהצלחה") }} />}
              {activeTab === "announcements" && <AnnouncementForm item={editingItem} onSuccess={() => { closeModal(); toast.success("נשמר בהצלחה") }} />}
              {activeTab === "events" && <EventForm item={editingItem} onSuccess={() => { closeModal(); toast.success("נשמר בהצלחה") }} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Components ---

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <p>{text}</p>
    </div>
  )
}

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function ScheduleForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageSchedule(fd); onSuccess(); }} className="space-y-4">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="כותרת התפילה / השיעור" name="title" defaultValue={item?.title} placeholder="לדוגמה: שחרית" required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="שעה" name="time_of_day" type="time" defaultValue={item?.time_of_day} required />
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">יום בשבוע</label>
          <div className="relative">
            <select name="day_of_week" defaultValue={item?.day_of_week ?? ""} className="w-full appearance-none border border-slate-300 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="">כל השבוע</option>
              {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
          </div>
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
      <Input label="כותרת המודעה" name="title" defaultValue={item?.title} required />
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">תוכן המודעה</label>
        <textarea
          name="content"
          required
          defaultValue={item?.content}
          className="w-full border border-slate-300 p-3 rounded-xl bg-slate-50 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
        />
      </div>
      <label className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors">
        <input type="checkbox" name="is_pinned" defaultChecked={item?.is_pinned} className="w-5 h-5 accent-orange-500" />
        <span className="text-sm font-bold text-orange-800">נעץ מודעה בראש הרשימה</span>
      </label>
      <SubmitButton color="bg-orange-600 hover:bg-orange-700" text="פרסם מודעה" />
    </form>
  );
}

function EventForm({ item, onSuccess }: any) {
  return (
    <form action={async (fd) => { await manageEvent(fd); onSuccess(); }} className="space-y-4">
      <input type="hidden" name="id" value={item?.id || ""} />
      <Input label="שם האירוע" name="title" defaultValue={item?.title} required />
      <Input label="מיקום" name="location" defaultValue={item?.location} placeholder="למשל: בבית הכנסת" />
      <Input label="תאריך ושעה" name="start_time" type="datetime-local" defaultValue={item?.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : ""} required />
      <SubmitButton color="bg-green-600 hover:bg-green-700" text="שמור אירוע" />
    </form>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700 block mb-1">{label}</label>
      <input className="w-full border border-slate-300 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" {...props} />
    </div>
  );
}

function SubmitButton({ color = "bg-blue-600 hover:bg-blue-700", text = "שמור שינויים" }: any) {
  return (
    <button className={`w-full ${color} text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95 mt-2`}>
      {text}
    </button>
  );
}

function Actions({ onEdit, onDelete, vertical }: any) {
  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-2`}>
      <button onClick={(e) => { e.stopPropagation(); onEdit() }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="ערוך">
        <Edit2 size={18} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="מחק">
        <Trash2 size={18} />
      </button>
    </div>
  );
}