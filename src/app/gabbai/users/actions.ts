'use server';

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

/**
 * מוחק משתמש לחלוטין - גם מה-Auth וגם מהפרופיל (דרך Cascade אם מוגדר, או ישירות).
 * שימוש ב-supabaseAdmin מאפשר לעקוף RLS ולמחוק משתמשים מ-auth.users.
 */
export async function deleteUser(userId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        // 1. Manually delete from public.profiles FIRST to avoid Foreign Key violations
        // (If the DB is set up with 'ON DELETE RESTRICT', we must clean up children first)
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", userId);

        if (profileError) {
            console.error("Error deleting profile:", profileError);
            // We continue even if this fails, because maybe the profile is already gone?
            // But if it fails due to its OWN dependents, we will catch it here.
            throw new Error(`שגיאה במחיקת הפרופיל (ייתכן שיש נתונים מקושרים): ${profileError.message}`);
        }

        // 2. Delete from Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error("Error deleting user from Auth:", authError);
            throw new Error(`כישלון במחיקת המשתמש ממערכת ההזדהות: ${authError.message}`);
        }

        revalidatePath("/gabbai/users");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
