"use client";

import { useState } from "react";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/auth/signout", {
        method: "POST",
        credentials: "include",
      });
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

      // fallback
      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "שגיאה בעת התנתקות");
      setLoading(false);
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
