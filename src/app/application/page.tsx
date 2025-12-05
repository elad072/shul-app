"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function ApplicationPage() {
  const [familyName, setFamilyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
        // try to use metadata from provider
        const meta: any = (user as any).user_metadata ?? {};
        setFirstName(
          (
            meta?.given_name ||
            meta?.name ||
            user.user_metadata?.full_name ||
            ""
          ).split(" ")[0] || ""
        );
      } else {
        // no user — send to login
        router.push("/login");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!familyName || !firstName || !email) {
      setError('אנא מלא/י שם משפחה, שם פרטי ודוא"ל (מהחשבון)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName, firstName, phone, email }),
      });

      if (!res.ok) {
        // try to parse helpful message from server
        let message = "שגיאת שרת";
        try {
          const data = await res.json();
          message =
            data?.error || data?.message || JSON.stringify(data) || message;
        } catch (_) {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch (_) {
            // keep default
          }
        }
        setError(message);
        return;
      }

      // on success redirect to waiting-room (user will see confirmation)
      router.push("/waiting-room");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 rtl">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6 text-right">
        <h1 className="text-2xl font-bold mb-2">השאר פרטים לבקשה</h1>
        <p className="text-sm text-gray-500 mb-4">
          נשמור את פרטי המשפחה וקשר לשם בדיקה ואישור על ידי הגבאי.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">שם משפחה</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">שם פרטי</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">טלפון</label>
              <input
                className="mt-1 w-full border rounded p-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">
              דוא"ל (ממולא אוטומטית)
            </label>
            <input
              className="mt-1 w-full border rounded p-2 bg-gray-50"
              value={email}
              readOnly
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-70"
            >
              {loading ? "שולח..." : "שלח בקשה"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}
