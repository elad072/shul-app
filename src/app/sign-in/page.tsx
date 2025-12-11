'use client';

import { supabase } from "@/lib/supabaseClient";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  const login = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          // prompt: "consent",
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 border border-slate-200">

        <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
          מעון קודשך
        </h1>

        <p className="text-slate-600 text-center mb-8">
          מערכת ניהול קהילה — התחברות מאובטחת
        </p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow transition"
        >
          <LogIn size={20} />
          התחבר עם Google
        </button>

      </div>
    </div>
  );
}
