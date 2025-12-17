import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Clock, LogOut } from "lucide-react";

export default async function PendingPage() {
  async function logout() {
    "use server";
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );
    await supabase.auth.signOut();
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
        {/* Top decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>

        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-amber-100 border-t-amber-400 animate-spin transition-all duration-1000"></div>
          <Clock size={40} className="text-amber-500" />
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
          הבקשה התקבלה
        </h1>

        <div className="space-y-4 text-slate-600 mb-8">
          <p className="text-lg leading-relaxed">
            פרטיך נקלטו במערכת והועברו לאישור הגבאים.
          </p>
          <p className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            לאחר האישור, תקבל גישה מלאה לאפליקציה ולכל השירותים של בית הכנסת.
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-red-500 hover:bg-red-50 px-6 py-2 rounded-full transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            יציאה מהמערכת
          </button>
        </form>
      </div>
    </div>
  );
}
