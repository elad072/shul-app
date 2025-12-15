// שים לב! אנחנו מייבאים מהקובץ הספציפי בתוך התיקייה
import { createSupabaseServer } from "@/lib/supabase/server";

export async function auth() {
  // 1. יוצרים את הלקוח עם await
  const supabase = await createSupabaseServer();

  // 2. עכשיו שהלקוח מוכן, אפשר לקרוא ל-getSession
  const { data, error } = await supabase.auth.getSession();

  return {
    user: data?.session?.user ?? null,
    error,
  };
}