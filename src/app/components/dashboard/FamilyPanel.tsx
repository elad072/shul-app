"use client";

import { User, Plus, ChevronLeft } from "lucide-react";

export default function FamilyPanel() {
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">המשפחה שלי</h2>
          <p className="text-xs text-slate-500">ניהול נפשות ופרטים</p>
        </div>
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <User size={20} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Main User Card */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">משתמש ראשי</label>
          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              יש
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm">ישראל ישראלי</p>
              <p className="text-slate-500 text-xs">ראש משפחה</p>
            </div>
            <ChevronLeft size={16} className="text-slate-300" />
          </div>
        </div>

        {/* Family Members */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
             <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">בני משפחה נוספים</label>
             <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">2 נפשות</span>
          </div>
          
          {/* Member 1 */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              רח
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">רחל ישראלי</p>
              <p className="text-slate-400 text-xs">אשה</p>
            </div>
          </div>

          {/* Member 2 */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
              דוד
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">דוד ישראלי</p>
              <p className="text-slate-400 text-xs">ילד</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button className="w-full flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} />
          הוסף בן משפחה חדש
        </button>
      </div>
    </div>
  );
}
