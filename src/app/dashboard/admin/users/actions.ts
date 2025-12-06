"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
  const supabase = createClient();
  
  // 1. זיהוי המשתמש המבצע
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. ווידוא שהמשתמש הוא גבאי
  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!requesterProfile?.is_gabbai) {
    throw new Error("רק גבאי רשאי לאשר משתמשים");
  }

  // 3. עדכון הסטטוס
  const { error } = await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  // 4. רענון הדף כדי שהמשתמש יעלם מהרשימה או שהסטטוס יתעדכן
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}