import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string) {
          res.cookies.set(name, value);
        },
        remove(name: string) {
          res.cookies.delete(name);
        },
      },
    }
  );

  return res;
}

export const config = {
  matcher: [
    "/auth/:path*",      // ← חובה כדי לקלוט session אחרי Google
    "/dashboard/:path*",
    "/pending",
    "/rejected",
  ],
};
