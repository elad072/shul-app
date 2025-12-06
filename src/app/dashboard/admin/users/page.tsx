import { createClient } from "@/utils/supabase/server";
import ApproveButton from "./ApproveButton";

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: pending } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, status, role, is_gabbai")
    .eq("status", "pending");

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-4">

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">ניהול משתמשים</h1>
        <p className="mt-2 text-sm text-gray-600">רשימת משתמשים שממתינים לאישור</p>
      </header>

      <section className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">

        <div className="hidden md:grid grid-cols-5 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-700 border-b">
          <div>שם מלא</div>
          <div>אימייל</div>
          <div>טלפון</div>
          <div>תפקיד</div>
          <div className="text-center">פעולה</div>
        </div>

        <div className="divide-y divide-gray-100">
          {pending && pending.length > 0 ? (
            pending.map((p) => (
              <div
                key={p.id}
                className="flex flex-col md:grid md:grid-cols-5 md:items-center gap-4 md:gap-0 px-4 md:px-6 py-5 hover:bg-gray-50 transition"
              >
                <div className="font-medium text-gray-900">{p.first_name} {p.last_name}</div>
                <div className="text-gray-700 truncate">{p.email}</div>
                <div className="text-gray-700">{p.phone || "-"}</div>
                <div className="text-gray-700">{p.role || "משתמש"}</div>
                <div className="flex justify-center"><ApproveButton userId={p.id} /></div>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-gray-500 text-center text-sm">
              אין משתמשים ממתינים לאישור
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
