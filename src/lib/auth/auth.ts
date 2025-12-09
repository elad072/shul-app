"use server";

import { createSupabaseServer } from "@/lib/supabaseServer";

export async function auth() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return { user: data.user };
}
