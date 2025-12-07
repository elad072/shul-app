import { createClient } from "@/utils/supabase/server";
import { Users, Search } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  // שליפת משתמשים מהדאטה-בייס
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">

      {/* כותרת + סיכום */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-indigo-600" />
            ניהול משתמשים
          </h1>
          <p className="text-gray-500 mt-1">
            צפייה ועריכה של כל המשתמשים במערכת
          </p>
        </div>

        <div className="bg-indigo-600 text-white px-5 py-2 rounded-xl shadow-md text-sm font-semibold">
          סה״כ משתמשים: {users?.length || 0}
        </div>
      </header>

      {/* תיבת חיפוש (בעתיד: פילטרים) */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="חיפוש משתמש..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* טבלה */}
      <div className="bg-white shadow-card-lg border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                שם מלא
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                אימייל
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                טלפון
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                סטטוס
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {users?.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* שם */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </td>

                {/* אימייל */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>

                {/* טלפון */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.phone || "-"}
                </td>

                {/* סטטוס */}
                <td className="px-6 py-4 text-sm text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : user.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.status === "approved"
                      ? "מאושר"
                      : user.status === "pending"
                      ? "ממתין"
                      : user.status}
                  </span>
                </td>
              </tr>
            ))}

            {/* מצב ריק */}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  אין משתמשים במערכת.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
