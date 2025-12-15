import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// הפונקציה צריכה להיות async כי cookies() ב-Next.js 15 מחזיר Promise
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // שיטה חדשה: קריאת כל העוגיות בבת אחת
        getAll() {
          return cookieStore.getAll();
        },
        // שיטה חדשה: כתיבת עוגיות (כולל טיפול בשגיאות)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ה-try/catch הזה קריטי!
            // לפעמים Supabase מנסה לרענן את הטוקן (לכתוב עוגיה) בזמן רינדור דף.
            // ב-Next.js זה אסור וגורם לקריסה. ה-catch מתעלם מהשגיאה הזו
            // (כי ה-Middleware אמור לטפל ברענון הטוקן במקום הדף).
          }
        },
      },
    }
  );
}