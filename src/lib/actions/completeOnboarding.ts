"use server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { decodeToken } from "@/lib/auth/decodeToken";

export async function completeOnboarding(formData: FormData) {
  const token = formData.get("token")?.toString();
  const user = decodeToken(token);

  if (!user?.sub) {
    throw new Error("Unauthorized");
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Update profile status
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      status: "pending_approval",
      onboarding_completed: true,
    })
    .eq("id", user.sub);

  if (error) {
    console.error("ONBOARDING UPDATE ERROR:", error);
    throw new Error(JSON.stringify(error));
  }

  return { success: true };
}
