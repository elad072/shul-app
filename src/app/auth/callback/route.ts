import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  console.log("🟡 Callback: נכנסנו ל־/auth/callback");

  const cookieStore = await cookies(); // ← זה הפתרון!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string) {
          cookieStore.set(name, value);
        },
        remove(name: string) {
          cookieStore.set(name, "");
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(req.url);

  console.log("🟢 Callback: נתונים שהתקבלו =", data);

  if (error) {
    console.error("🔴 Callback: שגיאה =", error);
    return NextResponse.redirect("/sign-in");
  }

  console.log("✅ Callback: הצלחה — session נוצר!");

  return NextResponse.redirect("/dashboard");
}
