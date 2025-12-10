import { createSupabaseServer } from "@/lib/supabase/server";

export async function auth() {
  const supabase = createSupabaseServer();

  // SSR → חייב getSession()
  const { data: sessionData, error } = await supabase.auth.getSession();

  return {
    user: sessionData?.session?.user ?? null,
    error
  };
}
