"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { toHebrewDateStringAdjusted, getHebrewDateParts } from "@/lib/hebrewUtils";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );
}

/* =======================
   MEMBERS
======================= */

export async function getFamilyMembers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("created_by", user.id)
    .order("birth_date");

  return data || [];
}

export async function addFamilyMember(formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("משתמש לא מחובר");

  const birth_date = formData.get("birth_date") as string;
  const rawBorn = formData.get("born_after_sunset");
  const born_after_sunset = rawBorn === "on" || rawBorn === "true";

  const payload: any = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    role: formData.get("role"),
    gender: formData.get("gender"),
    tribe: formData.get("tribe"),
    born_after_sunset,
    created_by: user.id,
    updated_by: user.id,
  };

  if (birth_date) {
    payload.birth_date = birth_date;
    payload.hebrew_birth_date = toHebrewDateStringAdjusted(birth_date, born_after_sunset);
  }

  const { data, error } = await supabase
    .from("members")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Add Member Error:", error);
    throw new Error(`שגיאה בהוספה: ${error.message}`);
  }

  revalidatePath("/dashboard/family");
  return data;
}

export async function updateFamilyMember(id: string, formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("משתמש לא מחובר");

  const birth_date = formData.get("birth_date") as string;
  const rawBorn = formData.get("born_after_sunset");
  const born_after_sunset = rawBorn === "on" || rawBorn === "true";

  const payload: any = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    role: formData.get("role"),
    gender: formData.get("gender"),
    tribe: formData.get("tribe"),
    born_after_sunset,
    updated_by: user.id,
  };

  if (birth_date) {
    payload.birth_date = birth_date;
    payload.hebrew_birth_date = toHebrewDateStringAdjusted(birth_date, born_after_sunset);
  }

  const { data, error } = await supabase
    .from("members")
    .update(payload)
    .eq("id", id)
    .eq("created_by", user.id)
    .select()
    .single();

  if (error) {
    console.error("Update Member Error:", error);
    throw new Error(`שגיאה בעדכון: ${error.message}`);
  }

  if (!data) {
    console.error("Update Member Failed: No matching row found. User:", user.id, "ID:", id);
    throw new Error("לא נמצאה רשומה לעדכון, או שאין לך הרשאה.");
  }

  revalidatePath("/dashboard/family");
  return data;
}

export async function deleteFamilyMember(id: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", id)
    .single();

  if (member?.role === "head") {
    throw new Error("לא ניתן למחוק אב משפחה");
  }

  const { error } = await supabase.from("members").delete().eq("id", id).eq("created_by", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/family");
}

/* =======================
   EVENTS
======================= */

export async function addFamilyEvent(formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // ✅ תיקון קריטי – שם השדה הנכון
  const gregorian_date = formData.get("gregorian_date") as string;

  if (!gregorian_date) {
    throw new Error("Missing gregorian_date");
  }

  const parts = getHebrewDateParts(gregorian_date);

  await supabase.from("personal_events").insert({
    member_id: formData.get("member_id"),
    description: formData.get("description"),
    event_type: formData.get("event_type"),
    gregorian_date,
    hebrew_day: parts.day,
    hebrew_month: parts.month,
    created_by: user.id,
  });

  revalidatePath("/dashboard/family");
  revalidatePath("/dashboard/events");
}

export async function updateFamilyEvent(id: string, formData: FormData) {
  const supabase = await getSupabase();

  // ✅ תיקון קריטי – שם השדה הנכון
  const gregorian_date = formData.get("gregorian_date") as string;

  if (!gregorian_date) {
    throw new Error("Missing gregorian_date");
  }

  const parts = getHebrewDateParts(gregorian_date);

  await supabase
    .from("personal_events")
    .update({
      description: formData.get("description"),
      event_type: formData.get("event_type"),
      gregorian_date,
      hebrew_day: parts.day,
      hebrew_month: parts.month,
    })
    .eq("id", id);

  revalidatePath("/dashboard/family");
  revalidatePath("/dashboard/events");
}
export async function deleteFamilyEvent(id: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("personal_events")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  revalidatePath("/dashboard/family");
  revalidatePath("/dashboard/events");
}
