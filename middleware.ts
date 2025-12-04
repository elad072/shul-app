import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // יצירת תגובה ראשונית
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // הגדרת הקליינט של Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // בדיקת המשתמש מול Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/auth");
  const isLoginRoute = path === "/login";
  const isWaitingRoom = path === "/waiting-room";
  // קבצים סטטיים לא צריכים בדיקה
  const isStaticAsset = path.match(/\.(.*)$/) || path.startsWith("/_next");

  if (isStaticAsset || isAuthRoute || isLoginRoute) {
    return response;
  }

  // אם אין משתמש -> לוגין
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // בדיקת סטטוס בטבלת פרופילים
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  // הגנה קריטית: אם אין פרופיל או שהוא Pending -> חדר המתנה
  if ((!profile || profile.status === "pending") && !isWaitingRoom) {
    return NextResponse.redirect(new URL("/waiting-room", request.url));
  }

  // אם מאושר ומנסה להיכנס לחדר המתנה -> דאשבורד
  if (profile?.status === "approved" && isWaitingRoom) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
