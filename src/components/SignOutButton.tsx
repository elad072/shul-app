"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      // 1. clear Supabase client-side session first
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.signOut();

      // 2. then call server to clear cookies
      const res = await fetch("/auth/signout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      if (res.redirected && res.url) {
        window.location.href = res.url;
        return;
      }

      // try to parse JSON with redirect
      try {
        const data = await res.json();
        if (data?.redirect) {
          window.location.href = data.redirect;
          return;
        }
      } catch (_) {
        // ignore
      }

      // fallback: navigate to login
      window.location.href = "/login";
    } catch (err: any) {
      console.error("SignOut error:", err);
      // on error, show message and auto-redirect after delay
      setError(err?.message || "שגיאה בעת התנתקות");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  };

  return (
    <div>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="text-sm text-gray-400 hover:text-gray-600 underline"
      >
        {loading ? "מתנתק..." : "התנתק מהמערכת"}
      </button>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
}
