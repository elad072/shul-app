"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/* ------------------------------------------------------------------ */
/* SUPABASE CLIENT — SERVER SIDE                                      */
/* ------------------------------------------------------------------ */

async function createClient() {
  const cookieStore = await cookies(); // בלי await!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value ?? null,
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set(name, value, options);
          } catch {}
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {}
        },
      },
    }
  );
}

/* ------------------------------------------------------------------ */
/* ADD FAMILY                                                         */
/* ------------------------------------------------------------------ */

export async function addFamily(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    family_name: formData.get("family_name"),
    address: formData.get("address") || null,
    city: "ירושלים",
    home_phone: formData.get("phone") || null,
  };

  const { data, error } = await supabase
    .from("families")
    .insert(rawData)
    .select("*");

  if (error) {
    console.error("Supabase AddFamily Error:", error);
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

/* ------------------------------------------------------------------ */
/* ADD MEMBER                                                         */
/* ------------------------------------------------------------------ */

export async function addMember(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    family_id: formData.get("family_id"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name") || null,
    email: formData.get("email") || null,
    phone: formData.get("phone") || null,
    role: "head",
    gender: "male",
    is_student: false,
  };

  const { data, error } = await supabase
    .from("members")
    .insert(rawData)
    .select("*");

  if (error) {
    console.error("Supabase AddMember Error:", error);
    return { success: false, message: error.message };
  }

  return { success: true, data };
}
