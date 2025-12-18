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

        // 0. Get member_id first to ensure we can clean up related member data
        const { data: profileRecord } = await supabaseAdmin
            .from("profiles")
            .select("member_id")
            .eq("id", userId)
            .single();

        // 1. Manually delete from public.profiles FIRST
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", userId);

        if (profileError) {
            console.error("Error deleting profile:", profileError);
            throw new Error(`שגיאה במחיקת הפרופיל: ${profileError.message}`);
        }

        // 1.5 Delete from public.members if linked
        if (profileRecord?.member_id) {
            const { error: memberError } = await supabaseAdmin
                .from("members")
                .delete()
                .eq("id", profileRecord.member_id);

            if (memberError) {
                console.error("Error deleting member record:", memberError);
                // We don't throw here to ensure Auth deletion still happens, 
                // but we log it.
            }
        }

        // 2. Delete from Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            // אם המשתמש לא נמצא ב-Auth (למשל כי הוא "חבר אורח" שנוסף ידנית), נתעלם מהשגיאה
            if (authError.message === "User not found") {
                console.log("User not found in Auth, skipping Auth deletion.");
            } else {
                console.error("Error deleting user from Auth:", authError);
                throw new Error(`כישלון במחיקת המשתמש ממערכת ההזדהות: ${authError.message}`);
            }
        }

        revalidatePath("/gabbai/users");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
