import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Force cookies to last 30 days
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              maxAge: 60 * 60 * 24 * 30, // 30 days
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            });
          } catch { /* Server Component ReadOnly */ }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch { /* Server Component ReadOnly */ }
        }
      }
    }
  );
}
