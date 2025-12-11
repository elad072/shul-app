"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { toHebrewDateString, getHebrewDateParts } from "@/lib/hebrewUtils";

export async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );
}

// 1. שליפה עם לוגים
export async function getFamilyMembers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
      console.log("❌ getFamilyMembers: No user logged in");
      return { head: null, others: [] };
  }

  // לוג לבדיקת ה-ID
  console.log(`🔍 Fetching members for user ID: ${user.id}`);

  // שליפת כולם מטבלת members
  const { data: allMembers, error } = await supabase
    .from("members")
    .select("*")
    .eq("created_by", user.id)
    .order("birth_date", { ascending: true });

  if (error) {
      console.error("❌ Supabase Error in getFamilyMembers:", error);
  } else {
      console.log(`✅ Members found: ${allMembers?.length || 0}`);
  }

  const members = allMembers || [];
  
  const head = members.find((m: any) => m.role === 'head') || null;
  const others = members.filter((m: any) => m.role !== 'head');

  return { head, others };
}

// 2. הוספת בן משפחה
export async function addFamilyMember(formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const first_name = formData.get("first_name") as string;
  const role = formData.get("role") as string;
  const gender = formData.get("gender") as string;
  const birth_date = formData.get("birth_date") as string;
  const hebrew_birth_date = birth_date ? toHebrewDateString(birth_date) : null;

  const { error } = await supabase.from("members").insert({
    first_name, role, gender, birth_date: birth_date || null, hebrew_birth_date,
    created_by: user.id, is_student: role === 'child'
  });

  if (error) { console.error(error); throw new Error("Failed to add member"); }
  revalidatePath("/dashboard/family");
}

// 3. מחיקת חבר
export async function deleteFamilyMember(memberId: string) {
  const supabase = await getSupabase();
  await supabase.from("members").delete().eq("id", memberId);
  revalidatePath("/dashboard/family");
}

// 4. עדכון
export async function updateMember(memberId: string, formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  const first_name = formData.get("first_name") as string;
  const role = formData.get("role") as string;
  const gender = formData.get("gender") as string;
  const birth_date = formData.get("birth_date") as string;
  const hebrew_birth_date = birth_date ? toHebrewDateString(birth_date) : null;

  const { error } = await supabase
    .from("members")
    .update({
        first_name, role, gender, birth_date: birth_date || null,
        hebrew_birth_date, is_student: role === 'child'
    })
    .eq("id", memberId);

  if (error) throw new Error("Failed to update member");
  
  if (role === 'head' && user) {
      await supabase.from("profiles").update({ first_name }).eq("id", user.id);
  }

  revalidatePath("/dashboard/family");
  revalidatePath("/dashboard"); 
}

// 5. הוספת אירוע
export async function addFamilyEvent(formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const member_id = formData.get("member_id") as string;
  const description = formData.get("description") as string;
  const gregorian_date = formData.get("event_date") as string;
  const event_type = formData.get("event_type") as string;

  let hebrew_day = null, hebrew_month = null;
  if (gregorian_date) {
    const parts = getHebrewDateParts(gregorian_date);
    hebrew_day = parts.day;
    hebrew_month = parts.month;
  }

  const { error } = await supabase.from("personal_events").insert({
    member_id, description, event_type, 
    gregorian_date: gregorian_date || null,
    hebrew_day, hebrew_month,
    created_by: user.id
  });

  if (error) throw new Error(`Failed to add event`);
  revalidatePath("/dashboard/family");
  revalidatePath("/dashboard");
}

// 6. עדכון אירוע
export async function updateFamilyEvent(eventId: string, formData: FormData) {
  const supabase = await getSupabase();
  const description = formData.get("description") as string;
  const gregorian_date = formData.get("event_date") as string;
  const event_type = formData.get("event_type") as string;

  let hebrew_day = null, hebrew_month = null;
  if (gregorian_date) {
    const parts = getHebrewDateParts(gregorian_date);
    hebrew_day = parts.day;
    hebrew_month = parts.month;
  }

  await supabase.from("personal_events").update({ 
      description, event_type, gregorian_date: gregorian_date || null,
      hebrew_day, hebrew_month 
  }).eq("id", eventId);

  revalidatePath("/dashboard/family");
}

// 7. מחיקת אירוע
export async function deleteFamilyEvent(eventId: string) {
  const supabase = await getSupabase();
  await supabase.from("personal_events").delete().eq("id", eventId);
  revalidatePath("/dashboard/family");
  revalidatePath("/dashboard");
}
