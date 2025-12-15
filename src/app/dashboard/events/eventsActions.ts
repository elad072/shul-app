"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAllEventsByMember() {
  const cookieStore = await cookies(); // חובה לחכות ל-await

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // שלב אבחון: נסה להבין אם הבעיה בשליפה או בחיבור
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
    // הוספתי הזמנה לוגית
    .order("last_name");

  if (error) {
    console.error("Supabase Error:", error);
    return [];
  }

  return data;
}