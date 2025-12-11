"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Clock, MessageSquare, Calendar, X } from "lucide-react";
import { manageAnnouncement, deleteAnnouncement, manageEvent, deleteEvent, manageSchedule, deleteSchedule } from "./actions";

export default function GabbaiTabs({ announcements, events, schedules }: any) {
  const [activeTab, setActiveTab] = useState("schedules");
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
    if (type === 'announcement') await deleteAnnouncement(id);
    if (type === 'event') await deleteEvent(id);
    if (type === 'schedule') await deleteSchedule(id);
  };

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // --- טפסים ---
  const ScheduleForm = () => (
    <form action={async (fd) => { await manageSchedule(fd); closeModal(); }} className="space-y-4">
      <input type="hidden" name="id" value={editingItem?.id || ""} />
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="text-xs text-slate-500">שם התפילה/שיעור</label>
            <input name="title" required defaultValue={editingItem?.title} placeholder="שחרית" className="w-full border p-2 rounded" />
        </div>
        <div>
            <label className="text-xs text-slate-500">שעה</label>
            <input name="time_of_day" type="time" required defaultValue={editingItem?.time_of_day} className="w-full border p-2 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="text-xs text-slate-500">יום</label>
            <select name="day_of_week" defaultValue={editingItem?.day_of_week ?? "-1"} className="w-full border p-2 rounded bg-white">
                <option value="-1">כל יום</option>
                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
        </div>
        <div>
            <label className="text-xs text-slate-500">סוג</label>
            <select name="type" defaultValue={editingItem?.type || "prayer"} className="w-full border p-2 rounded bg-white">
                <option value="prayer">תפילה</option>
                <option value="class">שיעור</option>
                <option value="other">אחר</option>
            </select>
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">שמור</button>
    </form>
  );

  const AnnouncementForm = () => (
    <form action={async (fd) => { await manageAnnouncement(fd); closeModal(); }} className="space-y-4">
      <input type="hidden" name="id" value={editingItem?.id || ""} />
      <div>
          <label className="text-xs text-slate-500">כותרת</label>
          <input name="title" required defaultValue={editingItem?.title} className="w-full border p-2 rounded" />
      </div>
      <div>
          <label className="text-xs text-slate-500">תוכן</label>
          <textarea name="content" required defaultValue={editingItem?.content} className="w-full border p-2 rounded h-24" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="is_pinned" defaultChecked={editingItem?.is_pinned} id="pin" />
        <label htmlFor="pin">נעץ הודעה בראש הלוח</label>
      </div>
      <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded font-bold">פרסם</button>
    </form>
  );

  const EventForm = () => (
    <form action={async (fd) => { await manageEvent(fd); closeModal(); }} className="space-y-4">
      <input type="hidden" name="id" value={editingItem?.id || ""} />
      <div>
          <label className="text-xs text-slate-500">שם האירוע</label>
          <input name="title" required defaultValue={editingItem?.title} className="w-full border p-2 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500">תאריך ושעה</label>
            <input name="start_time" type="datetime-local" required defaultValue={editingItem?.start_time ? new Date(editingItem.start_time).toISOString().slice(0, 16) : ""} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-xs text-slate-500">מיקום</label>
            <input name="location" defaultValue={editingItem?.location} className="w-full border p-2 rounded" />
          </div>
      </div>
      <div>
          <label className="text-xs text-slate-500">תיאור</label>
          <textarea name="description" defaultValue={editingItem?.description} className="w-full border p-2 rounded h-20" />
      </div>
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">שמור אירוע</button>
    </form>
  );

  return (
    <div>
      {/* טאבים לניווט */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        {[
          { id: "schedules", label: "זמני תפילות", icon: <Clock size={16} /> },
          { id: "announcements", label: "הודעות", icon: <MessageSquare size={16} /> },
          { id: "events", label: "אירועים", icon: <Calendar size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* כפתור הוספה צף */}
      <button 
        onClick={() => openModal()}
        className="w-full mb-6 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        {activeTab === "schedules" ? "הוסף זמן תפילה/שיעור" : activeTab === "announcements" ? "כתוב הודעה חדשה" : "צור אירוע קהילתי"}
      </button>

      {/* רשימת תפילות */}
      {activeTab === "schedules" && (
        <div className="space-y-2">
          {schedules.map((s: any) => (
            <div key={s.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="text-center bg-slate-50 p-2 rounded-lg min-w-[60px]">
                        <span className="block text-xs text-slate-500">{s.day_of_week === null ? "כל יום" : days[s.day_of_week]}</span>
                        <span className="block font-bold text-slate-800">{s.time_of_day.slice(0,5)}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-700">{s.title}</h3>
                        <p className="text-xs text-slate-500">{s.type === 'prayer' ? 'תפילה' : 'שיעור'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openModal(s)} className="p-2 bg-slate-50 rounded-full text-blue-600 hover:bg-blue-100"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(s.id, 'schedule')} className="p-2 bg-slate-50 rounded-full text-red-500 hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* רשימת הודעות */}
      {activeTab === "announcements" && (
        <div className="space-y-3">
          {announcements.map((a: any) => (
            <div key={a.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative">
                {a.is_pinned && <span className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">נעוץ</span>}
                <h3 className="font-bold text-slate-800 pr-8">{a.title}</h3>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{a.content}</p>
                <div className="flex gap-2 mt-3 justify-end border-t pt-2">
                    <button onClick={() => openModal(a)} className="text-xs flex items-center gap-1 text-blue-600 font-medium"><Edit2 size={14} /> ערוך</button>
                    <button onClick={() => handleDelete(a.id, 'announcement')} className="text-xs flex items-center gap-1 text-red-500 font-medium"><Trash2 size={14} /> מחק</button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* רשימת אירועים */}
      {activeTab === "events" && (
        <div className="space-y-3">
          {events.map((e: any) => (
            <div key={e.id} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
               <div className="bg-green-50 text-green-700 p-2 rounded-lg text-center min-w-[60px] h-fit">
                 <span className="block text-lg font-bold leading-none">{new Date(e.start_time).getDate()}</span>
                 <span className="block text-[10px]">{new Date(e.start_time).toLocaleString('he-IL', { month: 'short' })}</span>
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-800">{e.title}</h3>
                 <p className="text-xs text-slate-500 mb-1">{e.location} | {new Date(e.start_time).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</p>
                 <div className="flex gap-3 mt-2">
                    <button onClick={() => openModal(e)} className="text-xs text-blue-600 font-medium">ערוך</button>
                    <button onClick={() => handleDelete(e.id, 'event')} className="text-xs text-red-500 font-medium">מחק</button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* מודל כללי */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">
                        {editingItem ? "עריכת פריט" : "הוספת פריט חדש"}
                    </h3>
                    <button onClick={closeModal}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6">
                    {activeTab === "schedules" && <ScheduleForm />}
                    {activeTab === "announcements" && <AnnouncementForm />}
                    {activeTab === "events" && <EventForm />}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
