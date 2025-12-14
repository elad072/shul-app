"use client";

import { useMemo, useState } from "react";
import { toHebrewDateStringAdjusted, formatForInput } from "@/lib/hebrewUtils";

type Props = {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel?: string;
};

export default function MemberForm({ initialData, onSubmit, submitLabel = "שמור" }: Props) {
  const [birthDate, setBirthDate] = useState<string>(formatForInput(initialData?.birth_date ?? null));
  const [bornAfterSunset, setBornAfterSunset] = useState<boolean>(!!initialData?.born_after_sunset);

  const hebrewPreview = useMemo(() => {
    if (!birthDate) return "";
    return toHebrewDateStringAdjusted(birthDate, bornAfterSunset);
  }, [birthDate, bornAfterSunset]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await onSubmit(fd);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">שם פרטי *</label>
          <input
            name="first_name"
            defaultValue={initialData?.first_name ?? ""}
            required
            className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">שם משפחה</label>
          <input
            name="last_name"
            defaultValue={initialData?.last_name ?? ""}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">תפקיד במשפחה *</label>
          <select
            name="role"
            defaultValue={initialData?.role ?? "child"}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
          >
            <option value="head">ראש משפחה</option>
            <option value="spouse">בן/בת זוג</option>
            <option value="child">ילד/ה</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">מין *</label>
          <select
            name="gender"
            defaultValue={initialData?.gender ?? "male"}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
          >
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">כהן / לוי / ישראל</label>
          <select
            name="tribe"
            defaultValue={initialData?.tribe ?? "yisrael"}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
          >
            <option value="yisrael">ישראל</option>
            <option value="levi">לוי</option>
            <option value="kohen">כהן</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">תאריך לידה (לועזי)</label>
          <input
            type="date"
            name="birth_date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="born_after_sunset"
          checked={bornAfterSunset}
          onChange={(e) => setBornAfterSunset(e.target.checked)}
          className="rounded border-slate-300"
        />
        נולד לאחר צאת הכוכבים (מוסיף יום בחישוב התאריך העברי)
      </label>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="text-xs text-slate-500 mb-1">תאריך עברי (תצוגה)</div>
        <div className="text-base font-bold text-slate-800">{hebrewPreview || "-"}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
          <input
            name="phone"
            defaultValue={initialData?.phone ?? ""}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
          <input
            type="email"
            name="email"
            defaultValue={initialData?.email ?? ""}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">פרשת בר מצווה</label>
          <input
            name="bar_mitzvah_parasha"
            defaultValue={initialData?.bar_mitzvah_parasha ?? ""}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">תאריך עליה אחרונה</label>
          <input
            type="date"
            name="last_aliyah_at"
            defaultValue={formatForInput(initialData?.last_aliyah_at ?? null)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-sm"
      >
        {submitLabel}
      </button>
    </form>
  );
}
