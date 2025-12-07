import { createServerClientInstance } from "@/utils/supabase/server";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function DashboardPage() {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading profiles:", error.message);
    return (
      <div className="text-red-600 font-semibold">
        אירעה שגיאה בטעינת המשתמשים.
      </div>
    );
  }

  const users = data as Profile[];

  return (
    <div dir="rtl">
      <h1 className="text-3xl font-bold mb-6">רשימת משתמשים</h1>

      <div className="bg-white rounded-xl shadow border p-4 divide-y">
        {users.length === 0 ? (
          <div className="py-4 text-gray-500 text-center">
            אין משתמשים להצגה.
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="py-3">
              <span className="font-semibold">{u.first_name} {u.last_name}</span>
              <span className="text-gray-600"> — {u.email}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
