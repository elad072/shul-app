"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAllEventsByMember() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const { data, error } = await supabase
    .from("members")
    .select(`
      id,
      first_name,
      last_name,
      personal_events (
        id,
        event_type,
        description,
        gregorian_date
      )
    `)
    .order("last_name");

  if (error) return [];
  return data;
}
