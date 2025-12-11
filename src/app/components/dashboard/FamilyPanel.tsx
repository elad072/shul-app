"use client";

import { User, Plus, Trash2, Baby, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { getFamilyMembers, deleteFamilyMember } from "./familyActions";
import AddMemberModal from "./AddMemberModal";
import { usePathname } from "next/navigation";

export default function FamilyPanel() {
  const pathname = usePathname();
  // Hooks חייבים לרוץ תמיד באותו סדר - בלי תנאים לפניהם!
  const [data, setData] = useState<any>({ head: null, others: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const result = await getFamilyMembers();
      setData(result || { head: null, others: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // טוענים נתונים רק אם אנחנו לא בדף כניסה
    if (pathname !== "/sign-in") {
      loadData();
    }
  }, [pathname]);

  async function handleDelete(id: string) {
    if (confirm("האם למחוק בן משפחה זה?")) {
      await deleteFamilyMember(id);
      loadData();
    }
  }

  const getAvatarStyle = (gender: string) => 
    gender === 'female' 
      ? "bg-gradient-to-br from-rose-100 to-pink-200 text-rose-600" 
      : "bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-600";

  // --- התיקון: הבדיקה וה-return נמצאים כאן, אחרי כל ה-Hooks ---
  if (pathname === "/sign-in") return null;

  return (
    <div className="h-full bg-white flex flex-col relative border-r border-slate-200">
      
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div>
          <h2 className="text-lg font-bold text-slate-800">המשפחה שלי</h2>
          <p className="text-xs text-slate-500">תצוגה מהירה</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-full text-blue-600">
          <User size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {data?.head && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} /> ראש משפחה
            </label>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
                {data.head.first_name?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">{data.head.first_name} {data.head.last_name}</p>
                <p className="text-slate-500 text-xs">מנהל חשבון</p>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-slate-100 pb-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                 <Baby size={12} /> בני משפחה
               </label>
               <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                 {data?.others?.length || 0} נפשות
               </span>
            </div>
            
            {(!data?.others || data.others.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                אין בני משפחה נוספים
              </p>
            )}

            {data?.others?.map((member: any) => (
              <div key={member.id} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors group relative border border-transparent hover:border-slate-100">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarStyle(member.gender)}`}>
                  {member.first_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm">{member.first_name}</p>
                  <p className="text-slate-400 text-xs">
                    {member.role === 'spouse' ? (member.gender === 'female' ? 'אישה' : 'בעל') : (member.gender === 'female' ? 'ילדה' : 'ילד')}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  title="מחק"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
        >
          <Plus size={16} />
          הוסף בן משפחה
        </button>
      </div>

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadData} 
      />
    </div>
  );
}
