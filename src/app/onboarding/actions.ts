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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string) {
          cookieStore.set(name, value);
        },
        remove(name: string) {
          cookieStore.set(name, "");
        },
      },
    }
  );

  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;
  if (!user) {
    return redirect("/sign-in");
  }

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const gender = formData.get("gender") as string;
  const member_type = formData.get("member_type") as string;
  const isGabbai = formData.get("isGabbai") === "on";

  const role = isGabbai ? "gabbai" : member_type;

  const { error } = await supabase.from("profile").insert({
    id: user.id,
    email: user.email,
    first_name,
    last_name,
    phone,
    gender,
    member_type,
    role,
    status: "pending_approval",
    onboarding_completed: false,
  });

  if (error) {
    console.error("❌ Error saving onboarding:", error);
    throw new Error("Failed to save onboarding");
  }

  return redirect("/pending");
}
