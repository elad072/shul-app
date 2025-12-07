import { createServerClientInstance } from "@/utils/supabase/server";
import ApproveButton from "./ApproveButton";
import { UserCheck, Clock } from "lucide-react";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
};

export default async function AdminUsersPage() {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pending");

  if (error) console.error("Supabase error:", error);

  // ⬅⬅⬅ הפתרון — תמיד מערך תקין
  const pending: Profile[] = data ?? [];

  const hasPending = pending.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">אישור משתמשים</h1>
        <p className="text-gray-500 mt-1">ניהול בקשות הצטרפות חדשות</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* מצב ריק */}
        {!hasPending && (
          <div className="p-12 text-center">
            <UserCheck className="text-green-600 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">הכל מעודכן!</h3>
            <p className="text-gray-500">אין בקשות חדשות.</p>
          </div>
        )}

        {/* רשימת ממתינים */}
        {hasPending && (
          <div className="divide-y divide-gray-100">
            {pending.map((user) => (
              <div
                key={user.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {user.first_name?.[0] || "?"}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h3>

                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.phone ?? "אין טלפון"}</p>

                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-full">
                      <Clock size={12} />
                      ממתין לאישור
                    </div>
                  </div>
                </div>

                <ApproveButton userId={user.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
