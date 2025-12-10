import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import Form from "./Form";

export default async function OnboardingPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {} // לא נדרש כאן כי זה דף GET
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/sign-in");

  // שליפת פרופיל קיים (אם יש)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="card" style={{ direction: "rtl", textAlign: "center", padding: "2rem" }}>
      <h1>השלמת פרטים</h1>
      <Form profile={profile} />
    </div>
  );
}
