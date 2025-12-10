import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookies();
          return store.get(name)?.value;
        },
        async set(name: string, value: string) {
          const store = await cookies();
          store.set(name, value);
        },
        async remove(name: string) {
          const store = await cookies();
          store.set(name, "", { maxAge: -1 });
        }
      }
    }
  );
}
