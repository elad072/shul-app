"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addFamilyMember,
  updateFamilyMember,
} from "./familyActions";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
};

export default function AddMemberModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: Props) {
  const [data, setData] = useState<any>({
    first_name: "",
    last_name: "",
    role: "child",
    gender: "male",
    birth_date: "",
    hebrew_birth_date: "",
    born_after_sunset: false,
    tribe: "israel",
  });

  useEffect(() => {
    if (initialData) {
      setData({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        role: initialData.role || "child",
        gender: initialData.gender || "male",
        birth_date: initialData.birth_date || "",
        hebrew_birth_date: initialData.hebrew_birth_date || "",
        born_after_sunset: initialData.born_after_sunset || false,
        tribe: initialData.tribe || "israel",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (initialData?.id) {
      await updateFamilyMember(initialData.id, formData);
    } else {
      await addFamilyMember(formData);
    }

    onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6 space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {initialData ? "עריכת בן משפחה" : "הוספת בן משפחה"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* שם */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">שם פרטי</label>
              <input
                className="mt-1 w-full border rounded-xl p-3"
                value={data.first_name}
                onChange={(e) => setData({ ...data, first_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">שם משפחה</label>
              <input
                className="mt-1 w-full border rounded-xl p-3"
                value={data.last_name}
                onChange={(e) => setData({ ...data, last_name: e.target.value })}
              />
            </div>
          </div>

          {/* תפקיד */}
          <div>
            <label className="text-sm font-medium">תפקיד במשפחה</label>
            <select
              className="mt-1 w-full border rounded-xl p-3"
              value={data.role}
              onChange={(e) => setData({ ...data, role: e.target.value })}
            >
              <option value="head">אב משפחה</option>
              <option value="spouse">בן / בת זוג</option>
              <option value="child">ילד / ילדה</option>
            </select>
          </div>

          {/* מין ושבט */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">מין</label>
              <select
                className="mt-1 w-full border rounded-xl p-3"
                value={data.gender}
                onChange={(e) => setData({ ...data, gender: e.target.value })}
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">שבט</label>
              <select
                className="mt-1 w-full border rounded-xl p-3"
                value={data.tribe}
                onChange={(e) => setData({ ...data, tribe: e.target.value })}
              >
                <option value="israel">ישראל</option>
                <option value="kohen">כהן</option>
                <option value="levi">לוי</option>
              </select>
            </div>
          </div>

          {/* תאריכי לידה */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">תאריך לידה (לועזי)</label>
              <input
                type="date"
                className="mt-1 w-full border rounded-xl p-3"
                value={data.birth_date}
                onChange={(e) => setData({ ...data, birth_date: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">תאריך עברי</label>
              <input
                className="mt-1 w-full border rounded-xl p-3"
                placeholder="י״ב ניסן"
                value={data.hebrew_birth_date}
                onChange={(e) =>
                  setData({ ...data, hebrew_birth_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* אחרי שקיעה */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.born_after_sunset}
              onChange={(e) =>
                setData({ ...data, born_after_sunset: e.target.checked })
              }
            />
            נולד אחרי השקיעה
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold"
            >
              שמירה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
