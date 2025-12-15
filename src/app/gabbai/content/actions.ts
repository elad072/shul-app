"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- הודעות ---
export async function manageAnnouncement(formData: FormData) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const is_pinned = formData.get("is_pinned") === "on"; // תיקון חשוב לצ'קבוקס

    const data = { title, content, is_pinned };

    if (id) {
      await supabase.from("announcements").update(data).eq("id", id);
    } else {
      await supabase.from("announcements").insert({ ...data, created_by: user.id });
    }
    revalidatePath("/gabbai/content");
    revalidatePath("/dashboard");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createSupabaseServer();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/gabbai/content");
  revalidatePath("/dashboard");
}

// --- אירועים ---
export async function manageEvent(formData: FormData) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const start_time = formData.get("start_time") as string;

    const data = { 
       title, 
       location, 
       start_time: start_time ? new Date(start_time).toISOString() : null 
    };

    if (id) {
      await supabase.from("community_events").update(data).eq("id", id);
    } else {
      await supabase.from("community_events").insert({ ...data, created_by: user.id });
    }
    revalidatePath("/gabbai/content");
    revalidatePath("/dashboard");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteEvent(id: string) {
  const supabase = await createSupabaseServer();
  await supabase.from("community_events").delete().eq("id", id);
  revalidatePath("/gabbai/content");
  revalidatePath("/dashboard");
}

// --- זמנים ---
export async function manageSchedule(formData: FormData) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const time_of_day = formData.get("time_of_day") as string;
    const dayRaw = formData.get("day_of_week") as string;
    
    const day_of_week = dayRaw === "" ? null : parseInt(dayRaw);
    const data = { title, time_of_day, day_of_week };

    if (id) {
      await supabase.from("schedules").update(data).eq("id", id);
    } else {
      await supabase.from("schedules").insert({ ...data, created_by: user.id });
    }
    revalidatePath("/gabbai/content");
    revalidatePath("/dashboard");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteSchedule(id: string) {
  const supabase = await createSupabaseServer();
  await supabase.from("schedules").delete().eq("id", id);
  revalidatePath("/gabbai/content");
  revalidatePath("/dashboard");
}