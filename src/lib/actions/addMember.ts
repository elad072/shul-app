"use server";

import { createSupabaseServer } from "@/lib/supabaseServer";

export async function addMember(formData: FormData) {
  const supabase = await createSupabaseServer(); // ← חובה await!

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const gender = formData.get("gender") as string;
  const is_student = formData.get("is_student") === "on";

  const { data, error } = await supabase
    .from("members")
    .insert({
      first_name,
      last_name,
      email,
      phone,
      gender,
      is_student,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
