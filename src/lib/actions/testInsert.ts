"use server";

import { createSupabaseServer } from "@/lib/supabaseServer";

export async function testInsert() {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from("profiles_test")         // צור טבלה זמנית בסופבייס
    .insert([{ message: "Hello Server!" }])
    .select();

  if (error) {
    console.error("Insert error:", error);
    throw error;
  }

  return data;
}
