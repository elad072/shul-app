'use client'; // <--- השורה הזו פותרת את הבעיה

import { useState, useEffect } from "react";
// שיניתי לשימוש ב-Intl של ג'אווהסקריפט כדי לא להסתבך עם ספריות חיצוניות כרגע
// או שנתקין את date-fns בהמשך

export default function DashboardOverview() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <div className="p-6 space-y-6 rtl">
      {/* כותרת וברכה */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">שלום, גבאי יקר 👋</h1>
          <p className="text-gray-500">
            {date ? date.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'טוען תאריך...'}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          פרשת השבוע: ויחי (דוגמה)
        </div>
      </div>

      {/* גריד סטטיסטיקה */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* כרטיס 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">סה"כ חברים</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">124</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* כרטיס 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">ממתינים לאישור</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">3</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* כרטיס 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">תרומות החודש</p>
              <h3 className="text-2xl font-bold text-green-600 mt-2">₪4,250</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* כרטיס 4 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">אירועים קרובים</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-2">2</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* כפתורים לפעולות מהירות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium">
           <span className="text-2xl">+</span> הוסף חבר חדש
        </button>
        <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium">
           <span className="text-2xl">$</span> רישום תרומה
        </button>
        <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium">
           <span className="text-2xl">📢</span> שלח הודעה
        </button>
      </div>
    </div>
  );
}