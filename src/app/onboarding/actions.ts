"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { toHebrewDateString } from "@/lib/hebrewUtils";

export async function submitOnboarding(formData: FormData) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { } },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const isGabbai = formData.get("isGabbai") === "on";

  // הוספנו תאריך לידה לטופס ה-Onboarding? אם לא, כדאי להוסיף. אם אין, נשלח null
  // נניח שכרגע אין בטופס ה-HTML, אז נשמור null ונאפשר לו לערוך אח"כ
  // אבל אם תוסיף שדה בטופס בשם birth_date, תוכל לקלוט אותו כאן:
  const birth_date_raw = formData.get("birth_date") as string;
  const birth_date = birth_date_raw || null;

  let hebrew_birth_date = null;
  if (birth_date) {
    hebrew_birth_date = toHebrewDateString(birth_date);
  }

  // 1. קודם כל מטפלים ב-Member (יצירה או שליפה) כדי שיהיה לנו member_id
  let memberId: string | null = null;

  // בדיקה אם קיים כבר
  const { data: existingMember } = await supabase
    .from("members")
    .select("id")
    .eq("created_by", user.id)
    .eq("role", "head")
    .single();

  if (existingMember) {
    memberId = existingMember.id;
  } else {
    // יצירה חדשה
    const { data: newMember, error: memberError } = await supabase
      .from("members")
      .insert({
        first_name,
        last_name,
        role: 'head',
        gender: 'male', // ברירת מחדל
        birth_date,
        hebrew_birth_date,
        created_by: user.id,
        updated_by: user.id, // Fixed: Added missing field
      })
      .select("id")
      .single();

    if (memberError) {
      console.error("❌ Error creating member record:", memberError);
      throw new Error(`Failed to create member record: ${memberError.message} (${memberError.code})`);
    }
    memberId = newMember.id;
  }

  // 2. עדכון הפרופיל עם ה-member_id
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    first_name,
    last_name,
    phone,
    is_gabbai: isGabbai,
    role: isGabbai ? "gabbai" : "member",
    status: "pending_approval",
    onboarding_completed: true,
    birth_date,
    hebrew_birth_date,
    member_id: memberId, // <<< The Fix: Linking the member!
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    console.error("❌ Error updating profile:", profileError);
    throw new Error("Failed to save onboarding");
  }

  return redirect("/pending");
}
