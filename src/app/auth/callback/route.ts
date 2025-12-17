import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  // --- התיקון האמיתי ל-Codespaces ---
  // במקום לנחש, אנחנו לוקחים את הכתובת המקורית מה-Headers
  // זה עובד גם ב-Localhost וגם בענן
  const host = request.headers.get("x-forwarded-host") || requestUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") || "https";

  // בניית ה-Origin הנכון (בלי פורטים כפולים ובלי לשבור את הדומיין)
  const origin = `${protocol}://${host}`;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, {
                  ...options,
                  maxAge: 60 * 60 * 24 * 30, // 30 days 
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production'
                })
              );
            } catch {
              // Server Component ignores setAll
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // הפניה לכתובת המחושבת מה-Headers + הנתיב הרצוי
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // במקרה של שגיאה
  return NextResponse.redirect(`${origin}/sign-in?error=auth-code-error`);
}
