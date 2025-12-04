import { createClient } from "@/utils/supabase/server";
import { Users, Home, Megaphone, Calendar, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();

  // שליפות נתונים
  const [
    { count: membersCount },
    { count: familiesCount },
    { count: eventsCount },
    { count: announcementsCount },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("families").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("announcements").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      title: "סה״כ חברים",
      value: membersCount || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "בתי אב",
      value: familiesCount || 0,
      icon: Home,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "אירועים קרובים",
      value: eventsCount || 0,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "הודעות",
      value: announcementsCount || 0,
      icon: Megaphone,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
        <p className="text-gray-500 mt-2">
          ברוכים הבאים למערכת ניהול בית הכנסת
        </p>
      </div>

      {/* כרטיסי סטטיסטיקה */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-semibold text-gray-600">
                {stat.title}
              </h3>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {stat.value}
              </span>
              {/* אפשר להוסיף כאן בעתיד אחוז עלייה/ירידה */}
            </div>
          </div>
        ))}
      </div>

      {/* פעולות מהירות */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          פעולות מהירות
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/members"
            className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">הוספת חבר חדש</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
