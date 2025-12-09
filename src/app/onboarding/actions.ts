"use server";

import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {

  const id = formData.get("id") as string;
  const email = formData.get("email") as string;

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const gender = formData.get("gender") as string;
  const member_type = formData.get("member_type") as string;

  const isGabbai = formData.get("gabbai") ? true : false;

  const role = isGabbai ? "gabbai" : member_type;

  const { error } = await supabase.from("profile").insert({
    id,
    email,
    first_name,
    last_name,
    phone,
    gender,
    member_type,
    role,
    status: "pending_approval",
    onboarding_completed: false,
  });

  if (error) throw new Error(error.message);

  redirect("/pending");
}
