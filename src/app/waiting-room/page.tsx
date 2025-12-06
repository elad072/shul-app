import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function WaitingRoomPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "active") {
      redirect("/dashboard");
    }
  } else {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 rtl">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          ההרשמה התקבלה בהצלחה
        </h1>

        <p className="text-gray-600">
          תודה שנרשמת למערכת הקהילה.
          <br />
          פרטיך הועברו לבדיקה ואישור על ידי הגבאי.
        </p>

        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
          הודעה תישלח אליך למייל ברגע שהחשבון יאושר.
        </div>

        <div className="pt-4 border-t border-gray-100">
          {/* client-side signout to ensure proper redirect (works in Codespaces / origin variations) */}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
