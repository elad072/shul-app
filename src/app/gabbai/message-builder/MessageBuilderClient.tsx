"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildWhatsAppText, MessageSourceType } from "@/lib/whatsappTemplates";
import { getCurrentHebrewInfo } from "../../../lib/hebrewUtils";


type Props = {
  announcements: any[];
  events: any[];
  schedules: any[];
};

const STORAGE_KEY = "gabbai_message_builder_draft";
const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function groupSchedulesByDay(schedules: any[]) {
  const map: Record<string, any[]> = {};
  schedules.forEach((s) => {
    const key = s.day_of_week === null ? "everyday" : String(s.day_of_week);
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return map;
}

function buildDayScheduleMessage(dayKey: string, items: any[]) {
  const dayLabel =
    dayKey === "everyday" ? "כל יום" : DAYS[Number(dayKey)];

  const lines = items
    .sort((a, b) => a.time_of_day.localeCompare(b.time_of_day))
    .map(
      (s) => `🕒 ${s.title} – ${s.time_of_day.slice(0, 5)}`
    );

  return `🕍 זמני תפילות – ${dayLabel}\n\n${lines.join("\n")}`;
}

export default function MessageBuilderClient({
  announcements,
  events,
  schedules,
}: Props) {
  const [source, setSource] = useState<MessageSourceType>("announcement");
  const [draftMessage, setDraftMessage] = useState<string>("");

  const hasLoaded = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setDraftMessage(saved);
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    if (!draftMessage.trim()) return;
    localStorage.setItem(STORAGE_KEY, draftMessage);
  }, [draftMessage]);

  const items = useMemo(() => {
    if (source === "announcement") return announcements;
    if (source === "event") return events;
    return schedules;
  }, [source, announcements, events, schedules]);

  const addBlock = (block: string) => {
    setDraftMessage((prev) =>
      prev.trim()
        ? `${prev}\n\n────────────\n\n${block}`
        : block
    );
  };

  const addHebrewHeader = () => {
    const info = getCurrentHebrewInfo();
    const header = `📅 ${info.dateString} (${info.gregorianDate})\n📖 פרשת השבוע: ${info.parasha}\n\n`;
    setDraftMessage((prev) =>
      prev.startsWith("📅") ? prev : header + prev
    );
  };

  const sendWhatsApp = () => {
    if (!draftMessage.trim()) return;
    const encoded = encodeURIComponent(draftMessage);
    const isMobile = /Android|iPhone/i.test(navigator.userAgent);
    const url = isMobile
      ? `whatsapp://send?text=${encoded}`
      : `https://web.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        בניית הודעה לקהילה
      </h1>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
        {[
          { id: "announcement", label: "הודעות" },
          { id: "event", label: "אירועים" },
          { id: "schedule", label: "זמני תפילות" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSource(t.id as MessageSourceType)}
            className={`flex-1 py-3 rounded-xl font-bold ${
              source === t.id
                ? "bg-white shadow text-green-700"
                : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Picker */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold mb-4">בחירה</h2>

          {source === "schedule" ? (
            <div className="space-y-3">
              {Object.entries(groupSchedulesByDay(schedules)).map(
                ([dayKey, items]) => (
                  <button
                    key={dayKey}
                    onClick={() =>
                      addBlock(buildDayScheduleMessage(dayKey, items))
                    }
                    className="w-full text-right p-4 rounded-xl border hover:bg-green-50 hover:border-green-400"
                  >
                    <div className="font-bold mb-1">
                      {dayKey === "everyday"
                        ? "כל יום"
                        : DAYS[Number(dayKey)]}
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {items
                        .sort((a, b) =>
                          a.time_of_day.localeCompare(b.time_of_day)
                        )
                        .map((s) => (
                          <div key={s.id}>
                            {s.title} – {s.time_of_day.slice(0, 5)}
                          </div>
                        ))}
                    </div>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((it: any) => (
                <button
                  key={it.id}
                  onClick={() =>
                    addBlock(
                      buildWhatsAppText(source, it)?.trim() ||
                        "⚠️ לא ניתן לייצר הודעה אוטומטית."
                    )
                  }
                  className="w-full text-right p-3 rounded-xl border hover:bg-green-50 hover:border-green-400"
                >
                  <div className="font-medium">{it.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview + Editor */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold">הודעה לשליחה</h2>
            <button
              onClick={addHebrewHeader}
              className="text-sm text-blue-600 hover:underline"
            >
              ➕ הוסף כותרת עברית
            </button>
          </div>

          <div className="border rounded-xl p-3 bg-slate-50 text-sm h-80 overflow-y-auto whitespace-pre-line">
            {draftMessage || "ההודעה תופיע כאן…"}
          </div>

          <textarea
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            className="mt-3 border rounded-xl p-3 resize-none h-32"
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={sendWhatsApp}
              disabled={!draftMessage.trim()}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold disabled:bg-slate-300"
            >
              שלח ב-WhatsApp
            </button>

            <button
              onClick={() => {
                setDraftMessage("");
                localStorage.removeItem(STORAGE_KEY);
              }}
              className="border px-4 py-3 rounded-xl"
            >
              נקה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
