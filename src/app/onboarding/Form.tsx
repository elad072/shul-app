"use client";

import { useState } from "react";
import { submitOnboarding } from "./actions";

export default function Form({ userId, email }: { userId: string; email: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await submitOnboarding(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-4">

      <input type="hidden" name="id" value={userId} />
      <input type="hidden" name="email" value={email} />

      <input
        name="first_name"
        placeholder="שם פרטי"
        required
        className="border p-2 w-full rounded"
      />

      <input
        name="last_name"
        placeholder="שם משפחה"
        required
        className="border p-2 w-full rounded"
      />

      <input
        name="phone"
        placeholder="טלפון"
        required
        className="border p-2 w-full rounded"
      />

      <select name="gender" className="border p-2 w-full rounded" required>
        <option value="">בחר מין</option>
        <option value="male">זכר</option>
        <option value="female">נקבה</option>
      </select>

      <select name="member_type" className="border p-2 w-full rounded" required>
        <option value="">תפקיד במשפחה</option>
        <option value="head">ראש משפחה</option>
        <option value="spouse">בן/בת זוג</option>
        <option value="child">ילד</option>
      </select>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="gabbai" />
        אני גבאי
      </label>

      <button
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        {loading ? "שולח..." : "סיום הרשמה"}
      </button>
    </form>
  );
}
