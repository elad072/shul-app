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
  if (!user) throw new Error("Unauthorized");

  const birth_date = formData.get("birth_date") as string | null;
  const born_after_sunset = formData.get("born_after_sunset") === "on";

  await supabase.from("members").insert({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    role: formData.get("role"),
    gender: formData.get("gender"),
    tribe: formData.get("tribe"),
    birth_date,
    born_after_sunset,
    hebrew_birth_date: birth_date
      ? toHebrewDateStringAdjusted(birth_date, born_after_sunset)
      : null,
    created_by: user.id,
    updated_by: user.id,
  });

  revalidatePath("/dashboard/family");
}

export async function updateFamilyMember(id: string, formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const birth_date = formData.get("birth_date") as string | null;
  const born_after_sunset = formData.get("born_after_sunset") === "on";

  await supabase
    .from("members")
    .update({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      role: formData.get("role"),
      gender: formData.get("gender"),
      tribe: formData.get("tribe"),
      birth_date,
      born_after_sunset,
      hebrew_birth_date: birth_date
        ? toHebrewDateStringAdjusted(birth_date, born_after_sunset)
        : null,
      updated_by: user.id,
    })
    .eq("id", id)
    .eq("created_by", user.id);

  revalidatePath("/dashboard/family");
}

export async function deleteFamilyMember(id: string) {
  const supabase = await getSupabase();

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", id)
    .single();

  if (member?.role === "head") {
    throw new Error("לא ניתן למחוק אב משפחה");
  }

  await supabase.from("members").delete().eq("id", id);
  revalidatePath("/dashboard/family");
}

/* =======================
   EVENTS
======================= */

export async function addFamilyEvent(formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const gregorian_date = formData.get("event_date") as string;

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
}

export async function updateFamilyEvent(id: string, formData: FormData) {
  const supabase = await getSupabase();
  const gregorian_date = formData.get("event_date") as string;
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
}

export async function deleteFamilyEvent(id: string) {
  const supabase = await getSupabase();
  await supabase.from("personal_events").delete().eq("id", id);
  revalidatePath("/dashboard/family");
}
