import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. הגדרת הנתיב הנוכחי
  const path = request.nextUrl.pathname;

  // 2. יצירת תשובה ראשונית
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 3. חיבור ל-Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 4. שליפת המשתמש
  const { data: { user } } = await supabase.auth.getUser();

  // --- החרגות (נתיבים פתוחים לכולם) ---
  // אם זה נתיב סטטי, תמונות, לוגין או אימות - שחרר מיד
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/auth") || // חשוב מאוד! אחרת הלוגין יישבר
    path === "/login" ||
    path.includes(".") // קבצים כמו favicon.ico
  ) {
    return response;
  }

  // --- בדיקה 1: האם המשתמש מחובר? ---
  if (!user) {
    // אם לא מחובר ולא נמצא בדף לוגין -> שלח ללוגין
    if (path !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  // מכאן והלאה - המשתמש מחובר. בוא נבדוק את הפרופיל שלו ב-DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // --- בדיקה 2: האם חסרים פרטים? (Onboarding) ---
  // נניח שחובה שיהיה שם פרטי. אם אין פרופיל או אין שם -> onboarding
  const isMissingDetails = !profile || !profile.first_name || !profile.phone;
  
  if (isMissingDetails) {
    // המניעה של הלולאה: אם הוא כבר ב-onboarding, אל תפנה אותו שוב!
    if (path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return response; // תן לו להיות ב-onboarding
  }

  // אם המשתמש מנסה להיכנס ל-onboarding אבל כבר יש לו פרטים -> שלח אותו הלאה
  if (path === "/onboarding" && !isMissingDetails) {
     // נמשיך לבדיקות הבאות כדי לראות לאן לשלוח אותו
  }

  // --- בדיקה 3: האם הוא ממתין לאישור? (Pending) ---
  if (profile?.status === "pending") {
    // המניעה של הלולאה: אם הוא כבר בחדר המתנה, שחרר
    if (path !== "/waiting-room") {
      return NextResponse.redirect(new URL("/waiting-room", request.url));
    }
    return response;
  }

  // --- בדיקה 4: האם הוא מאושר? (Active) ---
  if (profile?.status === "active") {
    // משתמש פעיל לא צריך להיות בחדר המתנה או באונבורדינג
    if (path === "/waiting-room" || path === "/onboarding" || path === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // לכל שאר הדפים (כמו /dashboard) - תן לו להיכנס
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};