"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSupabaseAndCheckGabbai() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      console.error("❌ No user logged in");
      throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase.from("profiles").select("is_gabbai").eq("id", user.id).single();
  
  if (!profile?.is_gabbai) {
      console.error("❌ User is not a Gabbai:", user.id);
      throw new Error("רק גבאי מורשה לבצע פעולה זו");
  }

  return { supabase, user };
}

// --- הודעות (Announcements) ---
export async function manageAnnouncement(formData: FormData) {
  try {
    const { supabase, user } = await getSupabaseAndCheckGabbai();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const is_pinned = formData.get("is_pinned") === "on";

    let error;
    if (id) {
      const res = await supabase.from("announcements").update({ title, content, is_pinned }).eq("id", id);
      error = res.error;
    } else {
      const res = await supabase.from("announcements").insert({ title, content, is_pinned, created_by: user.id });
      error = res.error;
    }

    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/gabbai/content");
  } catch (e) {
    console.error("❌ Error in manageAnnouncement:", e);
    // לא לזרוק שגיאה כדי לא להקריס את ה-UI, אבל הלוג יופיע בטרמינל
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const { supabase } = await getSupabaseAndCheckGabbai();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/gabbai/content");
  } catch (e) {
    console.error("❌ Error deleting announcement:", e);
  }
}

// --- אירועים (Events) ---
export async function manageEvent(formData: FormData) {
  try {
    const { supabase, user } = await getSupabaseAndCheckGabbai();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const start_time = formData.get("start_time") as string;

    // המרה לפורמט ISO תקין
    const isoStartTime = start_time ? new Date(start_time).toISOString() : null;

    let error;
    if (id) {
      const res = await supabase.from("community_events").update({ title, description, location, start_time: isoStartTime }).eq("id", id);
      error = res.error;
    } else {
      const res = await supabase.from("community_events").insert({ title, description, location, start_time: isoStartTime, created_by: user.id });
      error = res.error;
    }

    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/gabbai/content");
  } catch (e) {
    console.error("❌ Error in manageEvent:", e);
  }
}

export async function deleteEvent(id: string) {
  try {
    const { supabase } = await getSupabaseAndCheckGabbai();
    const { error } = await supabase.from("community_events").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/gabbai/content");
  } catch (e) {
    console.error("❌ Error deleting event:", e);
  }
}

// --- זמני תפילה (Schedules) ---
export async function manageSchedule(formData: FormData) {
  try {
    const { supabase, user } = await getSupabaseAndCheckGabbai();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const time_of_day = formData.get("time_of_day") as string;
    const day_of_week_raw = formData.get("day_of_week") as string;
    const type = formData.get("type") as string;
    
    const day_of_week = (day_of_week_raw === "-1" || day_of_week_raw === "") ? null : parseInt(day_of_week_raw);

    let error;
    if (id) {
      const res = await supabase.from("schedules").update({ title, time_of_day, day_of_week, type }).eq("id", id);
      error = res.error;
    } else {
      const res = await supabase.from("schedules").insert({ title, time_of_day, day_of_week, type, created_by: user.id });
      error = res.error;
    }

    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/gabbai/content");
  } catch (e) {
    console.error("❌ Error in manageSchedule:", e);
  }
}

export async function deleteSchedule(id: string) {
  try {
    const { supabase } = await getSupabaseAndCheckGabbai();
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/gabbai/content");
  } catch (e) {
    console.error("❌ Error deleting schedule:", e);
  }
}
