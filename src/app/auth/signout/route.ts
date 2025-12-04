import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
              cookieStore.set(name, value, options)
            );
          } catch {
            // התעלמות
          }
        },
      },
    }
  );

  await supabase.auth.signOut();

  // --- הפתרון הבטוח ביותר (The Origin Fix) ---

  // 1. ננסה לקחת את הכתובת המדויקת שהדפדפן דיווח עליה (Origin)
  const origin = req.headers.get("origin") || req.headers.get("referer");

  // 2. אם מצאנו (וזה כמעט תמיד קיים ב-POST), נשתמש בזה
  if (origin) {
    // origin ב-Codespaces נראה בדיוק כמו שצריך: https://...-3000.app.github.dev
    // אנחנו רק מוסיפים לו את הנתיב /login
    // זהירות: לפעמים referer מגיע עם נתיב מלא, אז אנחנו לוקחים רק את הבסיס
    const baseUrl = new URL(origin).origin;
    return NextResponse.redirect(`${baseUrl}/login`, { status: 302 });
  }

  // 3. גיבוי למקרה חירום (Fallback)
  return NextResponse.redirect(new URL("/login", req.url), { status: 302 });
}
