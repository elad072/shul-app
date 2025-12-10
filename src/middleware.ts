import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 1. הכנת התגובה הבסיסית
  let supabaseResponse = NextResponse.next({ request });

  // 2. יצירת לקוח Supabase שמתאים ל-Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  // 3. בדיקת המשתמש המחובר
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // --- תרחיש א': משתמש לא מחובר ---
  if (!user) {
    // אם הוא לא בדף כניסה ולא בנתיבי אימות מערכת, שלח אותו להתחבר
    if (!path.startsWith("/sign-in") && !path.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return supabaseResponse;
  }

  // --- תרחיש ב': משתמש מחובר ---
  if (user) {
    // מניעת כניסה לדף ההתחברות אם כבר מחוברים
    if (path === "/sign-in") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // שליפת פרופיל לבדיקת סטטוס
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, onboarding_completed")
      .eq("id", user.id)
      .single();

    // הגדרה: האם צריך להשלים פרטים? (אם אין פרופיל או שהדגל false)
    const needsOnboarding = !profile || profile.onboarding_completed !== true;

    // בדיקה 1: השלמת פרטים (/onboarding)
    if (needsOnboarding) {
      // אם הוא לא בדף ה-onboarding, זרוק אותו לשם
      if (path !== "/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      // אם הוא כבר שם, תן לו להישאר
      return supabaseResponse; 
    }

    // אם הוא סיים onboarding אבל מנסה לחזור לשם ידנית -> שלח לדשבורד
    if (!needsOnboarding && path === "/onboarding") {
         return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // בדיקה 2: המתנה לאישור (/pending)
    // אם הסטטוס הוא pending_approval
    if (profile?.status === "pending_approval") {
      // חסום גישה לכל דף חוץ מ-pending
      if (path !== "/pending") {
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      return supabaseResponse;
    }

    // בדיקה 3: אם הוא ב-pending אבל הסטטוס כבר אושר -> שחרר אותו לדשבורד
    if (path === "/pending" && profile?.status !== "pending_approval") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  // הרגולר אקספרשן הזה מוודא שהמידלוואר רץ על כל הדפים
  // חוץ מקבצים סטטיים, תמונות ואייקונים
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
