import { createServerClientInstance } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const users = data ?? [];

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-4">רשימת משתמשים</h1>

      <div className="bg-white rounded-xl shadow border p-4">
        {users.map((u) => (
          <div key={u.id} className="py-2 border-b last:border-0">
            {u.first_name} {u.last_name} — {u.email}
          </div>
        ))}
      </div>
    </div>
  );
}
