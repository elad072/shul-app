import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: pending } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, status, role, is_gabbai")
    .eq("status", "pending");

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pending Users</h1>
      <div className="space-y-4">
        {pending && pending.length > 0 ? (
          pending.map((p: any) => (
            <div
              key={p.id}
              className="p-4 bg-white rounded shadow flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {p.first_name} {p.last_name}
                </div>
                <div className="text-sm text-gray-600">
                  {p.email} • {p.phone}
                </div>
              </div>
              <div>
                <ApproveButton userId={p.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-600">No pending users</div>
        )}
      </div>
    </div>
  );
}

function ApproveButton({ userId }: { userId: string }) {
  async function approve() {
    if (!confirm("Approve user?")) return;
    try {
      const res = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Approve failed");
      // simple reload
      location.reload();
    } catch (err) {
      alert((err as any)?.message || "Error");
    }
  }

  return (
    <button onClick={approve} className="btn btn-sm btn-primary">
      Approve
    </button>
  );
}
