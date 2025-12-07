"use server";

import { createServerClientInstance } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
  const supabase = await createServerClientInstance();

  // עדכון סטטוס המשתמש ל־active
  const { error } = await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", userId);

  if (error) {
    console.error("Failed to approve user:", error);
    return { success: false };
  }

  revalidatePath("/dashboard/admin/users");

  return { success: true };
}
