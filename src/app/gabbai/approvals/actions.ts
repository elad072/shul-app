"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// פונקציה עזר לוודא שהמשתמש הוא גבאי
async function checkGabbai() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!profile?.is_gabbai) {
    throw new Error("Unauthorized: Gabbai access only");
  }
  
  return supabase;
}

export async function approveUser(userId: string) {
  const supabase = await checkGabbai();

  const { error } = await supabase
    .from("profiles")
    .update({ 
      status: "approved", // שים לב: וודא שזה תואם ל-Enum בדאטהבייס שלך (אולי active?)
      approved_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) console.error("Error approving:", error);
  revalidatePath("/gabbai/approvals");
}

export async function rejectUser(userId: string) {
  const supabase = await checkGabbai();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", userId);

  if (error) console.error("Error rejecting:", error);
  revalidatePath("/gabbai/approvals");
}
