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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="card">
      <h1>השלמת פרטים</h1>
      <Form profile={profile} />
    </div>
  );
}
