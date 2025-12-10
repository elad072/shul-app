"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const isGabbai = formData.get("isGabbai") === "on";

  // Upsert: מעדכן או יוצר. חובה onboarding_completed: true
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    first_name,
    last_name,
    phone,
    is_gabbai: isGabbai,
    role: isGabbai ? "gabbai" : "member",
    status: "pending_approval",
    onboarding_completed: true,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error("❌ Error saving onboarding:", error);
    throw new Error("Failed to save onboarding");
  }

  return redirect("/pending");
}
