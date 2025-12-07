import DashboardCard from "@/components/DashboardCard";
import { Users, Plus, FileText, Settings } from "lucide-react";

export default async function MembersPage() {
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
      text: "צפה בכל החברים הרשומים",
      href: "/dashboard/members",
    },
    {
      icon: <FileText size={24} className="text-emerald-600" />,
      title: "בקשות חברות",
      text: "ניהול בקשות חברות ממתינות",
      href: "/dashboard/members/requests",
    },
    {
      icon: <Settings size={24} className="text-rose-600" />,
      title: "הגדרות חברות",
      text: "התאם הרשאות וסוגי חברות",
      href: "/dashboard/members/settings",
    },
  ];

  return (
    <div dir="rtl" className="space-y-10">
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">ניהול חברים 👥</h1>
        <p className="text-lg text-gray-600">
          ניהול מלא של חברי הקהילה וביקורת אחר פעילותם
        </p>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={'סה"כ חברים'}
          value="0"
          color="indigo"
          subtitle="חברים קיימים"
        />

        <StatCard
          title="בתי אב"
          value="0"
          color="violet"
          subtitle="משפחות רשומות"
        />

        <StatCard
          title="בקשות חדשות"
          value="0"
          color="emerald"
          subtitle="ממתינות לאישור"
        />

        <StatCard
          title="פעיל היום"
          value="0"
          color="rose"
          subtitle="משתמשים פעילים"
        />
      </section>

      {/* Welcome Card */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <DecorativeBubbles />
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold">בואו נתחיל 🚀</h2>
          <p className="text-white/90 text-lg">
            זה המקום שלך לנהל את חברי הקהילה בקלות וביעילות.
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

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          פעולות מהירות
        </h2>
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
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 עצה שימושית
        </h3>
        <p className="text-blue-800 text-sm md:text-base">
          כדי להוסיף חבר חדש, לחץ על כפתור "הוספת חבר חדש" ומלא את הפרטים.
          לאחר מכן יתבקש לאשר את החברות. חברים יכולים להיות מסוגים שונים לפי תפקידם בקהילה.
        </p>
      </section>
    </div>
  );
}

/* ---------------------- Components ---------------------- */

function StatCard({
  title,
  value,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  color: string;
  subtitle: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100/50 rounded-xl p-6 border border-${color}-200`}
    >
      <p className={`text-sm font-medium text-${color}-700`}>{title}</p>
      <p className={`text-3xl font-bold text-${color}-900 mt-2`}>{value}</p>
      <p className={`text-xs text-${color}-600 mt-2`}>{subtitle}</p>
    </div>
  );
}

function DecorativeBubbles() {
  return (
    <>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
    </>
  );
}
