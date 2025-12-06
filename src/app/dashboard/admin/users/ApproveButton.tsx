"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function ApproveButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function approve() {
    if (!confirm("לאשר משתמש זה?")) return;

    try {
      setLoading(true);

      const res = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Approve failed");

      location.reload();
    } catch (err) {
      alert("שגיאה באישור משתמש");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={approve}
      disabled={loading}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        <Check size={16} />
      )}
      {loading ? "מאשר..." : "אשר"}
    </button>
  );
}
