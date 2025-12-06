"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  console.log("--- התחלת עדכון פרופיל ---"); // לוג לבדיקה בטרמינל

  const supabase = createClient();

  // 1. קבלת המשתמש
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth Error:", authError);
    return { success: false, message: "שגיאת אימות משתמש" };
  }

  // 2. איסוף נתונים
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;

  // 3. שימוש ב-UPSERT במקום UPDATE
  // זה מבטיח שהשמירה תעבוד גם אם הפרופיל לא נוצר אוטומטית בהרשמה
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id, // חובה ב-upsert
      first_name,
      last_name,
      phone,
      status: "pending",
      email: user.email, // שומרים גם אימייל ליתר ביטחון
      role: "member", // ערך ברירת מחדל
    })
    .select(); // מוודא שהפעולה באמת בוצעה

  if (error) {
    console.error("Supabase Error:", error); // זה יופיע בטרמינל שלך ב-VS Code
    return { success: false, message: "שגיאת DB: " + error.message };
  }

  console.log("--- עדכון הצליח, מבצע הפניה ---");

  // 4. הפניה (חייבת להיות מחוץ ל-try/catch אם היה)
  redirect("/waiting-room");
}
