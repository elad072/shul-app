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
            // התעלמות משגיאות
          }
        },
      },
    }
  );

  // התנתקות
  await supabase.auth.signOut();

  // --- התיקון הסופי ("השיטה הבטוחה") ---
  // במקום לנחש פורטים, אנחנו לוקחים את הכתובת המקורית מה-Headers
  // זה עובד מושלם גם ב-Codespaces, גם ב-Vercel וגם ב-Localhost

  const host = req.headers.get("host"); // לדוגמה: potential-couscous...-3000.app.github.dev
  const protocol = req.headers.get("x-forwarded-proto") || "https";

  // בנייה פשוטה וישירה של הכתובת
  const loginUrl = `${protocol}://${host}/login`;

  return NextResponse.redirect(loginUrl, {
    status: 302,
  });
}
