import { createSupabaseServer } from "@/lib/supabase/server";

export async function auth() {
  const supabase = createSupabaseServer();

  // ❗ במקום getUser → חייבים getSession ב־Next.js 16
  const { data, error } = await supabase.auth.getSession();

  return {
    user: data?.session?.user ?? null,
    error
  };
}
