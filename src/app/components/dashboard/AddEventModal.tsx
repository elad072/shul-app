"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { addFamilyEvent, updateFamilyEvent } from "./familyActions";
import { formatForInput } from "@/lib/hebrewUtils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  initialData?: any;
  onSuccess?: () => void;
};

export default function AddEventModal({
  isOpen,
  onClose,
  member,
  initialData,
  onSuccess,
}: Props) {
  const [eventType, setEventType] = useState("birthday");
  const [description, setDescription] = useState("");
  const [gregorianDate, setGregorianDate] = useState("");

  useEffect(() => {
    // אם המודאל סגור, לא נוגעים
    if (!isOpen) return;

    if (initialData) {
      // EDIT: טוענים נתונים
      setEventType(initialData.event_type || "birthday");
      setDescription(initialData.description || "");
      setGregorianDate(formatForInput(initialData.gregorian_date));
    } else {
      // ADD: איפוס מוחלט
      setEventType("birthday");
      setDescription("");
      setGregorianDate("");
    }
  }, [isOpen, member?.id, initialData?.id]); // חשוב!

  if (!isOpen || !member) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fd = new FormData();
    fd.append("event_type", eventType);
    fd.append("description", description);
    fd.append("gregorian_date", gregorianDate);
    fd.append("member_id", member.id);

    if (initialData?.id) {
      await updateFamilyEvent(initialData.id, fd);
    } else {
      await addFamilyEvent(fd);
    }

    onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-6">
        <header className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {initialData ? "עריכת אירוע" : "הוספת אירוע"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">סוג אירוע</label>
            <select
              className="mt-1 w-full border rounded-xl p-3"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="birthday">יום הולדת</option>
              <option value="anniversary">יום נישואין</option>
              <option value="yahrzeit">יארצייט</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">תיאור</label>
            <input
              className="mt-1 w-full border rounded-xl p-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">תאריך לועזי</label>
            <input
              type="date"
              className="mt-1 w-full border rounded-xl p-3"
              value={gregorianDate}
              onChange={(e) => setGregorianDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
            >
              שמירה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
