"use client";

import { useState } from "react";

type Application = {
  id: string;
  family_name: string;
  applicant_first_name: string;
  applicant_last_name?: string;
  applicant_email: string;
  applicant_phone?: string;
  created_at: string;
};

export default function AdminApplicationsTable({
  applications,
}: {
  applications: Application[];
}) {
  const [items, setItems] = useState<Application[]>(applications || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const approve = async (id: string) => {
    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/applications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Server error");
      }

      // remove from list
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unknown error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.length === 0 && (
        <p className="text-sm text-gray-500">אין בקשות ממתינות</p>
      )}
      {items.map((app) => (
        <div
          key={app.id}
          className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
        >
          <div className="text-right">
            <div className="font-medium">{app.family_name}</div>
            <div className="text-sm text-gray-600">
              {app.applicant_first_name} {app.applicant_last_name}
            </div>
            <div className="text-sm text-gray-500">
              {app.applicant_email} • {app.applicant_phone}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(app.created_at).toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => approve(app.id)}
              disabled={loadingId === app.id}
              className="bg-green-600 text-white px-3 py-2 rounded"
            >
              {loadingId === app.id ? "..." : "אשר"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
