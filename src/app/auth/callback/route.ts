import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // 1. חישוב Origin נכון ל-Codespaces (כמו שעשינו בתיקון ה-404)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const cleanOrigin = `${protocol}://${host}`;

  if (code) {
    // 2. הכנת התשובה מראש (ההפניה לדאשבורד)
    const response = NextResponse.redirect(`${cleanOrigin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // 3. הטריק: עדכון העוגייה ישירות על אובייקט התשובה שחוזר לדפדפן
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 4. החזרת התשובה שכבר מכילה את העוגיות החדשות
      return response;
    }
  }

  // במקרה של שגיאה
  return NextResponse.redirect(`${cleanOrigin}/login?error=auth_code_error`);
}