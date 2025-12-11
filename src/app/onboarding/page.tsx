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
        setAll() {} // GET page — אין צורך לשכתב עוגיות
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-slate-200 p-8">
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">
          השלמת פרטים
        </h1>

        <p className="text-sm text-slate-600 mb-6 text-center">
          אנא השלם את פרטיך לצורך רישום לבית הכנסת.
        </p>

        <Form profile={profile} />
      </div>
    </div>
  );
}
