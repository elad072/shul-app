import { createSupabaseServer } from "@/lib/supabase/server";

export async function auth() {
  // 👇 שים לב! חובה להוסיף את המילה await כאן:
  const supabase = await createSupabaseServer();
  // 👆 אם תמחק את ה-await הזה, השגיאה תחזור.

  // עכשיו הקוד הזה יעבוד:
  const { data: sessionData, error } = await supabase.auth.getSession();

  return {
    user: sessionData?.session?.user ?? null,
    error
  };
}