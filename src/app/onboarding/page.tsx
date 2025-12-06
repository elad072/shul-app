"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    // אם חזרנו לכאן, סימן שהייתה שגיאה (אחרת היינו עוברים דף ב-redirect)
    if (result && !result.success) {
      setErrorMsg(result.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">השלמת פרטים</h1>
          <p className="text-gray-500 mt-2">
            כדי להמשיך, אנא השלם את פרטי הקשר שלך
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם פרטי <span className="text-red-500">*</span>
            </label>
            <input
              name="first_name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
              placeholder="ישראל"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם משפחה <span className="text-red-500">*</span>
            </label>
            <input
              name="last_name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
              placeholder="ישראלי"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              טלפון נייד <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              required
              dir="ltr"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right text-gray-900"
              placeholder="050-0000000"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "שומר..." : "שלח והמשך"}
          </button>
        </form>
      </div>
    </div>
  );
}
