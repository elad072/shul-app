import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import Form from "./Form";
import { Sparkles } from "lucide-react";

export default async function OnboardingPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { }
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="text-blue-600" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight text-center">
              ברוכים הבאים
            </h1>
            <p className="text-slate-500 mt-2 text-center text-lg">
              אנא השלם את פרטיך לצורך רישום
            </p>
          </div>

          <Form profile={profile} />

          <p className="text-xs text-center text-slate-400 mt-8">
            הפרטים שלך מאובטחים ושמורים בסטנדרט הגבוה ביותר
          </p>
        </div>
      </div>
    </div>
  );
}
