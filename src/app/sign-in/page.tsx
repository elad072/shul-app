'use client';

import { supabase } from "@/lib/supabaseClient";
import { LogIn, Sparkles } from "lucide-react";
import Image from "next/image";

export default function SignInPage() {
  const login = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#0F2027]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden">
              <Image src="/logo.png" alt="logo" fill className="object-contain p-2" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">
            מעון קודשך
          </h1>

          <p className="text-blue-100 text-center mb-8 text-sm flex items-center justify-center gap-1.5 opacity-80">
            <Sparkles size={14} className="text-amber-300" />
            מערכת ניהול קהילה חכמה
          </p>

          <button
            onClick={login}
            className="group w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <LogIn size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
            התחברות עם Google
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              © כל הזכויות שמורות לבית הכנסת מעון קודשך
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
