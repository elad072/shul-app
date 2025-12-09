"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { decodeToken } from "@/lib/auth/decodeToken";

export async function addMember(formData: FormData) {
  const token = formData.get("token")?.toString();
  const user = decodeToken(token);

  if (!user?.sub) throw new Error("Unauthorized");

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  const { error } = await supabaseAdmin.from("members").insert({
    first_name,
    last_name,
    gender: "male",
    role: "head",
    created_by: user.sub,
  });

  if (error) throw error;
}
