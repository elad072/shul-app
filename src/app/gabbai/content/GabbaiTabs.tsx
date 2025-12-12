"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Clock, MessageSquare, Calendar } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"schedules" | "announcements" | "events">(
    "schedules"
  );
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
    if (type === "announcement") await deleteAnnouncement(id);
    if (type === "event") await deleteEvent(id);
    if (type === "schedule") await deleteSchedule(id);
  };

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  /* ---------------- Tabs Header ---------------- */
  const tabs = [
    { id: "schedules", label: "זמני תפילות", icon: <Clock size={16} /> },
    { id: "announcements", label: "הודעות", icon: <MessageSquare size={16} /> },
    { id: "events", label: "אירועים", icon: <Calendar size={16} /> },
  ];

  /* ---------------- Forms ---------------- */
  const ScheduleForm = () => (
    <form
      action={async (fd) => {
        await manageSchedule(fd);
        closeModal();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={editingItem?.id || ""} />

      <div>
        <label className="text-xs text-slate-500">שם</label>
        <input
          name="title"
          required
          defaultValue={editingItem?.title}
          className="w-full border p-2 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500">שעה</label>
          <input
            name="time_of_day"
            type="time"
            required
            defaultValue={editingItem?.time_of_day}
            className="w-full border p-2 rounded-xl"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">יום</label>
          <select
            name="day_of_week"
            defaultValue={editingItem?.day_of_week ?? ""}
            className="w-full border p-2 rounded-xl bg-white"
          >
            <option value="">כל יום</option>
            {days.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold">
        שמור
      </button>
    </form>
  );

  const AnnouncementForm = () => (
    <form
      action={async (fd) => {
        await manageAnnouncement(fd);
        closeModal();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={editingItem?.id || ""} />

      <div>
        <label className="text-xs text-slate-500">כותרת</label>
        <input
          name="title"
          required
          defaultValue={editingItem?.title}
          className="w-full border p-2 rounded-xl"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500">תוכן</label>
        <textarea
          name="content"
          required
          defaultValue={editingItem?.content}
          className="w-full border p-2 rounded-xl h-28"
        />
      </div>

      <button className="w-full bg-orange-600 text-white py-2 rounded-xl font-bold">
        פרסם
      </button>
    </form>
  );

  const EventForm = () => (
    <form
      action={async (fd) => {
        await manageEvent(fd);
        closeModal();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={editingItem?.id || ""} />

      <div>
        <label className="text-xs text-slate-500">שם האירוע</label>
        <input
          name="title"
          required
          defaultValue={editingItem?.title}
          className="w-full border p-2 rounded-xl"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500">תאריך ושעה</label>
        <input
          name="start_time"
          type="datetime-local"
          required
          defaultValue={
            editingItem?.start_time
              ? new Date(editingItem.start_time).toISOString().slice(0, 16)
              : ""
          }
          className="w-full border p-2 rounded-xl"
        />
      </div>

      <button className="w-full bg-green-600 text-white py-2 rounded-xl font-bold">
        שמור
      </button>
    </form>
  );

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold ${
              activeTab === tab.id
                ? "bg-white shadow text-blue-600"
                : "text-slate-500"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          {tabs.find((t) => t.id === activeTab)?.label}
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold"
        >
          <Plus size={16} /> הוסף
        </button>
      </div>

      {/* Lists */}
      {activeTab === "schedules" && (
        <div className="space-y-2">
          {schedules.map((s: any) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-white border rounded-xl p-4"
            >
              <div>
                <div className="font-bold">{s.title}</div>
                <div className="text-xs text-slate-500">
                  {s.day_of_week === null
                    ? "כל יום"
                    : days[s.day_of_week]}{" "}
                  · {s.time_of_day.slice(0, 5)}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(s)}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(s.id, "schedule")}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="space-y-2">
          {announcements.map((a: any) => (
            <div key={a.id} className="bg-white border rounded-xl p-4">
              <div className="font-bold">{a.title}</div>
              <p className="text-sm text-slate-600 mt-1">{a.content}</p>
              <div className="flex gap-3 text-xs mt-3">
                <button onClick={() => openModal(a)}>ערוך</button>
                <button onClick={() => handleDelete(a.id, "announcement")}>
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-2">
          {events.map((e: any) => (
            <div key={e.id} className="bg-white border rounded-xl p-4">
              <div className="font-bold">{e.title}</div>
              <div className="text-xs text-slate-500">
                {new Date(e.start_time).toLocaleString("he-IL")}
              </div>
              <div className="flex gap-3 text-xs mt-3">
                <button onClick={() => openModal(e)}>ערוך</button>
                <button onClick={() => handleDelete(e.id, "event")}>
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            {activeTab === "schedules" && <ScheduleForm />}
            {activeTab === "announcements" && <AnnouncementForm />}
            {activeTab === "events" && <EventForm />}
          </div>
        </div>
      )}
    </div>
  );
}
