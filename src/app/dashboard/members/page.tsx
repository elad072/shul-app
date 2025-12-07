import DashboardCard from "@/components/DashboardCard";
import { Users, Plus, FileText, Settings } from "lucide-react";

export default function MembersPage() {
  const quickActions = [
    {
      icon: <Plus size={24} className="text-indigo-600" />,
      title: "הוספת חבר חדש",
      text: "הוסף חבר חדש לקהילה",
      href: "/dashboard/members/add",
    },
    {
      icon: <Users size={24} className="text-violet-600" />,
      title: "רשימת כל החברים",
      text: "צפה בכל החברים המורשאים",
      href: "/dashboard/members",
    },
    {
      icon: <FileText size={24} className="text-emerald-600" />,
      title: "בקשות חברות",
      text: "ניהול בקשות חברות ממתינות",
      href: "#",
    },
    {
      icon: <Settings size={24} className="text-rose-600" />,
      title: "הגדרות חברות",
      text: "התאם הרשאות וסוגי חברות",
      href: "#",
    },
  ];

  return (
    <div dir="rtl" className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">ניהול חברים 👥</h1>
        <p className="text-lg text-gray-600">
          ניהול מלא של חברי הקהילה וביקורה אחר פעילותם
        </p>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-6 border border-indigo-200">
          <p className="text-sm font-medium text-indigo-700">סה"כ חברים</p>
          <p className="text-3xl font-bold text-indigo-900 mt-2">0</p>
          <p className="text-xs text-indigo-600 mt-2">חברים בקיום</p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-6 border border-violet-200">
          <p className="text-sm font-medium text-violet-700">בתי אב</p>
          <p className="text-3xl font-bold text-violet-900 mt-2">0</p>
          <p className="text-xs text-violet-600 mt-2">משפחות רשומות</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-700">בקשות חדשות</p>
          <p className="text-3xl font-bold text-emerald-900 mt-2">0</p>
          <p className="text-xs text-emerald-600 mt-2">ממתינות לאישור</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-6 border border-rose-200">
          <p className="text-sm font-medium text-rose-700">פעיל היום</p>
          <p className="text-3xl font-bold text-rose-900 mt-2">0</p>
          <p className="text-xs text-rose-600 mt-2">פעילות זמנית</p>
        </div>
      </section>

      {/* Welcome Card */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold">בואו נתחיל 🚀</h2>
          <p className="text-white/90 text-lg">
            זה המקום שלך לנהל את חברי הקהילה בקלות ובחכמה
          </p>

          <div className="flex gap-3 pt-2">
            <a
              href="/dashboard/members/add"
              className="inline-block px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition shadow-md"
            >
              ➕ הוסף חבר חדש
            </a>
            <button className="inline-block px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition border border-white/30">
              📚 קרא עוד
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">פעולות מהירות</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => (
            <DashboardCard
              key={idx}
              icon={action.icon}
              title={action.title}
              text={action.text}
              href={action.href}
            />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-blue-50 border-r-4 border-blue-600 rounded-xl p-6 md:p-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 עצה שימושית</h3>
        <p className="text-blue-800 text-sm md:text-base">
          כדי להוסיף חבר חדש, לחץ על כפתור "הוספת חבר חדש" ומלא את הפרטים. 
          לאחר מכן יתבקש לאשר את החברות. חברים יכולים להיות מסוגים שונים תלוי בתפקידם בקהילה.
        </p>
      </section>
    </div>
  );
}
