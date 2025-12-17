import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-current-path", request.nextUrl.pathname);

    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // 1. Authenticated User Logic
    if (user) {
        // Fetch profile status
        const { data: profile } = await supabase
            .from("profiles")
            .select("status, onboarding_completed, is_gabbai")
            .eq("id", user.id)
            .single();

        // Safety check: if no profile found (rare), maybe let them pass or sign out?
        // We'll proceed only if we have profile data to check against.
        if (profile) {

            // A. Gabbai Protection (Strict)
            if (path.startsWith("/gabbai") && !profile.is_gabbai) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }

            // B. Onboarding Check
            if (!profile.onboarding_completed) {
                if (!path.startsWith("/onboarding")) {
                    return NextResponse.redirect(new URL("/onboarding", request.url));
                }
                // Allow access to /onboarding
                return response;
            }

            // C. Pending / Rejected Check (Only if onboarding is done)
            if (profile.status === 'pending_approval') {
                if (!path.startsWith("/pending")) {
                    // Start Logout if they try to go elsewhere? Or just gate them?
                    // Redirecting to pending is safer.
                    return NextResponse.redirect(new URL("/pending", request.url));
                }
                return response;
            }

            if (profile.status === 'rejected') {
                if (!path.startsWith("/rejected")) {
                    return NextResponse.redirect(new URL("/rejected", request.url));
                }
                return response;
            }

            // D. Active User Cleanup
            // If user is active/completed, they shouldn't be on these pages:
            if (path.startsWith("/sign-in") || path.startsWith("/onboarding") || path.startsWith("/pending") || path.startsWith("/rejected")) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }
    }

    // 2. Unauthenticated User Logic
    if (!user) {
        // Protect private routes
        if (
            path.startsWith("/dashboard") ||
            path.startsWith("/gabbai") ||
            path.startsWith("/onboarding") ||
            path.startsWith("/pending") ||
            path.startsWith("/rejected")
        ) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
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
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
