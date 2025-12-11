"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { addFamilyMember, updateMember } from "./familyActions";
import { formatForInput } from "@/lib/hebrewUtils"; // ייבוא הפונקציה

export default function AddMemberModal({ isOpen, onClose, onSuccess, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      if (isEditMode) {
        // בודק אם זה ראש משפחה כדי לשמור על ה-Role
        if (initialData.role === 'head') formData.set('role', 'head');
        await updateMember(initialData.id, formData);
      } else {
        await addFamilyMember(formData);
      }
      onSuccess(); 
      onClose();
    } catch (e) {
      alert("שגיאה בשמירה");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // המרת התאריך מהדאטהבייס לפורמט שהאינפוט מבין (yyyy-mm-dd)
  const defaultDate = initialData?.birth_date ? formatForInput(initialData.birth_date) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">
            {isEditMode ? "עריכת פרטים" : "הוספת בן משפחה"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">שם פרטי</label>
            <input 
              name="first_name" 
              required 
              defaultValue={initialData?.first_name || ""}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">תפקיד</label>
              <select 
                name="role" 
                className="w-full border border-slate-300 rounded-lg p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                defaultValue={initialData?.role || "child"}
                disabled={initialData?.role === 'head'} 
              >
                {initialData?.role === 'head' && <option value="head">ראש משפחה</option>}
                <option value="spouse">אישה / בעל</option>
                <option value="child">ילד/ה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מין</label>
              <select 
                name="gender" 
                className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                defaultValue={initialData?.gender || "male"}
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">תאריך לידה (לועזי)</label>
            <input 
              name="birth_date" 
              type="date" 
              defaultValue={defaultDate} // שימוש בערך המפורמט
              className="w-full border border-slate-300 rounded-lg p-2" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "שומר..." : "שמור שינויים"}
          </button>
        </form>
      </div>
    </div>
  );
}
