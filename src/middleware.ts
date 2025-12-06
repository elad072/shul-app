import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // נרצה לראות לוגים רק על נתיבים רלוונטיים כדי לא להציף את הטרמינל
  const isDebugPath = path === "/dashboard" || path === "/login" || path === "/onboarding";

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

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
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isDebugPath) {
    console.log(`[Middleware] Path: ${path}, User found? ${!!user}`);
  }

  // החרגות
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/auth") || 
    path === "/login" ||
    path.includes(".")
  ) {
    return response;
  }

  // בדיקת התחברות
  if (!user) {
    if (isDebugPath) console.log("[Middleware] No user, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // בדיקת פרופיל
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isMissingDetails = !profile || !profile.first_name || !profile.phone;
  
  if (isMissingDetails) {
    if (path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return response;
  }

  if (path === "/onboarding" && !isMissingDetails) {
     // המשיך הלאה
  }

  if (profile?.status === "pending") {
    if (path !== "/waiting-room") {
      return NextResponse.redirect(new URL("/waiting-room", request.url));
    }
    return response;
  }

  if (profile?.status === "active") {
    if (path === "/waiting-room" || path === "/onboarding" || path === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};