import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/application";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- התיקון החכם ---
      // בודק אם הגדרנו כתובת ספציפית (ב-Vercel או בקובץ env)
      // אם לא - משתמש בכתובת שממנה הגענו
      const forwardedHost = request.headers.get("x-forwarded-host"); // תמיכה ב-Vercel
      const isLocal = origin.includes("localhost");

      let siteUrl = origin;

      if (process.env.NEXT_PUBLIC_SITE_URL) {
        siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      } else if (forwardedHost) {
        siteUrl = `https://${forwardedHost}`;
      }

      // מוודאים שאין לוכסן כפול בסוף
      siteUrl = siteUrl.replace(/\/$/, "");

      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
