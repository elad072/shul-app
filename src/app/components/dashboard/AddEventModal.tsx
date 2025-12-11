"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { addFamilyEvent, updateFamilyEvent } from "./familyActions";
import { formatForInput } from "@/lib/hebrewUtils";

export default function AddEventModal({ isOpen, onClose, memberData, eventData, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  
  // אם eventData קיים, אנחנו במצב עריכה
  const isEditMode = !!eventData;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    try {
      if (isEditMode) {
        await updateFamilyEvent(eventData.id, formData);
      } else {
        await addFamilyEvent(formData);
      }
      onSuccess();
      onClose();
    } catch (e) {
      alert("שגיאה בשמירה");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const defaultDate = eventData?.gregorian_date ? formatForInput(eventData.gregorian_date) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in duration-200">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">
               {isEditMode ? "עריכת אירוע" : `הוספת אירוע ל${memberData.first_name}`}
            </h3>
            <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
           {/* אם זו הוספה חדשה, צריך לשלוח member_id */}
           {!isEditMode && <input type="hidden" name="member_id" value={memberData.id} />}
           
           <div>
             <label className="text-sm font-medium text-slate-700">תיאור האירוע</label>
             <input 
                name="description" 
                required 
                placeholder="למשל: יום הולדת 10" 
                defaultValue={eventData?.description || ""}
                className="w-full border p-2 rounded-lg mt-1" 
             />
           </div>

           <div>
             <label className="text-sm font-medium text-slate-700">סוג אירוע</label>
             <select 
                name="event_type" 
                className="w-full border p-2 rounded-lg mt-1 bg-white"
                defaultValue={eventData?.event_type || "birthday"}
             >
               <option value="birthday">יום הולדת 🎂</option>
               <option value="anniversary">יום נישואין 💍</option>
               <option value="yahrzeit">יארצייט (אזכרה) 🕯️</option>
               <option value="other">אחר</option>
             </select>
           </div>

           <div>
             <label className="text-sm font-medium text-slate-700">תאריך לועזי</label>
             <input 
                name="event_date" 
                type="date" 
                required 
                defaultValue={defaultDate}
                className="w-full border p-2 rounded-lg mt-1" 
             />
           </div>

           <div className="flex gap-2 mt-6">
             <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-100 rounded-lg text-slate-600 font-medium">ביטול</button>
             <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700">
               {loading ? "שומר..." : "שמור"}
             </button>
           </div>
         </form>
      </div>
    </div>
  );
}
