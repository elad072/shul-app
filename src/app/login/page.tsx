"use client"; // <--- חובה! שורה קריטית

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  // יצירת הקליינט עם המשתנים
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // מפנה לנתיב שיטפל ביצירת הסשן
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // שים לב: אנחנו לא עושים setLoading(false) כי המשתמש עובר לגוגל
    if (error) {
      console.error("Error signing in:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center border border-gray-100">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">ברוכים הבאים</h1>
        <p className="text-gray-500 mb-8">מערכת ניהול בית הכנסת</p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>מתחבר...</span>
          ) : (
            <>
              {/* אייקון קטן של גוגל */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#FFFFFF"
                />
              </svg>
              התחבר באמצעות Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
