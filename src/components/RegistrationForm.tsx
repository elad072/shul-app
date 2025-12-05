"use client";

import { useState } from "react";

type FormState = {
  familyName: string;
  address: string;
  city: string;
  homePhone: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  birthDate: string;
  additionalInfo: string;
};

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>({
    familyName: "",
    address: "",
    city: "",
    homePhone: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "head",
    gender: "male",
    birthDate: "",
    additionalInfo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = (k: keyof FormState, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // basic validation
    if (!form.familyName || !form.firstName || !form.email) {
      setError("אנא מלא/י שם משפחה, שם פרטי ודוא" + "" + "ל");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "שגיאה של שרת");
      }

      setSuccess("בקשתך נשלחה. המנהל יאשר בקרוב.");
      setForm({
        familyName: "",
        address: "",
        city: "",
        homePhone: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "head",
        gender: "male",
        birthDate: "",
        additionalInfo: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-2">בקשת הרשמה</h2>
        <p className="text-sm text-gray-500 mb-4">
          מלא/י פרטים על המשפחה ועליך. לאחר אישור הגבאי ניצור את הרשומות.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-right">
          <div>
            <label className="block text-sm font-medium">שם משפחה</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={form.familyName}
              onChange={(e) => update("familyName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">כתובת</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">עיר</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">טלפון ביתי</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={form.homePhone}
              onChange={(e) => update("homePhone", e.target.value)}
            />
          </div>

          <hr />

          <h3 className="font-medium">פרטי המבקש/ת</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">שם פרטי</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">שם משפחה</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">דוא"ל</label>
              <input
                type="email"
                className="mt-1 w-full border rounded p-2"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">טלפון</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">תפקיד במשפחה</label>
              <select
                className="mt-1 w-full border rounded p-2"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                <option value="head">ראש המשפחה</option>
                <option value="spouse">בן/בת זוג</option>
                <option value="child">ילד/ה</option>
                <option value="other">אחר</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">מגדר</label>
              <select
                className="mt-1 w-full border rounded p-2"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">תאריך לידה</label>
            <input
              type="date"
              className="mt-1 w-full border rounded p-2"
              value={form.birthDate}
              onChange={(e) => update("birthDate", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              הערות / מידע נוסף
            </label>
            <textarea
              className="mt-1 w-full border rounded p-2"
              rows={3}
              value={form.additionalInfo}
              onChange={(e) => update("additionalInfo", e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-70"
            >
              {loading ? "שולח..." : "שלח בקשת רישום"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </form>
      </div>
    </div>
  );
}
