"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { User, Phone, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    // אם יש תוצאה והיא אובייקט מסוג שגיאה
    if (result && "success" in result && !result.success) {
      setErrorMsg(result.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

        {/* כותרת */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            השלמת פרטים
          </h1>
          <p className="text-gray-500 mt-2">
            כמעט שם — כמה פרטים אחרונים כדי להתחיל
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* שם פרטי */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם פרטי <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="first_name"
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
                placeholder="ישראל"
              />
              <User className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* שם משפחה */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם משפחה <span className="text-red-500">*</span>
            </label>
            <input
              name="last_name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              placeholder="ישראלי"
            />
          </div>

          {/* טלפון */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              טלפון נייד <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="phone"
                required
                dir="ltr"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
                placeholder="050-0000000"
              />
              <Phone className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* הודעת שגיאה */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-right">
              {errorMsg}
            </div>
          )}

          {/* כפתור */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium text-lg 
            hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "שומר..." : "שמירה והמשך"}
          </button>
        </form>
      </div>
    </div>
  );
}
