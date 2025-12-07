import { createServerClientInstance } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerClientInstance();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // ⛑️ TypeScript-safe fallback
  const safeUsers = users ?? [];

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-4">רשימת משתמשים</h1>

      <div className="bg-white rounded-xl shadow border p-4">
        {safeUsers.length === 0 && (
          <div className="text-gray-500 text-sm">אין משתמשים במערכת.</div>
        )}

        {safeUsers.map((u) => (
          <div key={u.id} className="py-2 border-b last:border-0">
            {u.first_name} {u.last_name} — {u.email}
          </div>
        ))}
      </div>
    </div>
  );
}
