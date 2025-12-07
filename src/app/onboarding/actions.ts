"use server";

import { createServerClientInstance } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type UpdateResult =
  | { success: true }
  | { success: false; message: string };

export async function updateProfile(formData: FormData): Promise<UpdateResult> {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "לא נמצאה גישה למשתמש. התחבר מחדש." };
  }

  const first_name = formData.get("first_name") as string | null;
  const last_name = formData.get("last_name") as string | null;
  const phone = formData.get("phone") as string | null;

  if (!first_name || !last_name || !phone) {
    return { success: false, message: "יש למלא את כל שדות החובה." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ first_name, last_name, phone })
    .eq("id", user.id);

  if (updateError) {
    return {
      success: false,
      message: "שגיאה בשמירת הנתונים. נסה שוב מאוחר יותר.",
    };
  }

  // במקרה הצלחה → מעבר לדשבורד
  redirect("/dashboard");

  // לא יגיע לכאן, אבל TypeScript דורש return
  return { success: true };
}
