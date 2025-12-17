import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { approveUser, rejectUser } from "./actions";
import { Check, X, Phone, Mail, Calendar, User, ShieldCheck, ArrowRight } from "lucide-react";

export default async function GabbaiApprovalsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!currentUserProfile?.is_gabbai) {
    redirect("/dashboard");
  }

  const { data: pendingUsers } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 font-sans">
      <div className="mb-6">
        <a href="/gabbai" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowRight size={16} className="ml-1" />
          חזרה לדשבורד
        </a>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">אישורי משתמשים</h1>
        <p className="mt-2 text-slate-600">
          יש לאשר או לדחות חברים חדשים המבקשים להצטרף לקהילה.
        </p>
      </div>

      {pendingUsers?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">הכל מעודכן!</h3>
          <p className="text-slate-500">אין בקשות ממתינות לאישור כרגע.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingUsers?.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {profile.is_gabbai && (
                <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  בקשת גבאי
                </div>
              )}

              <div className="flex items-start justify-between mb-6 mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                    {(profile.first_name?.[0] || "")}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <Calendar size={12} />
                      <span>נרשם ב- {new Date(profile.created_at).toLocaleDateString("he-IL")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <Phone size={16} className="text-slate-400" />
                  <span dir="ltr">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <Mail size={16} className="text-slate-400" />
                  <span>{profile.email}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <form action={rejectUser.bind(null, profile.id)} className="flex-1">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-colors text-sm"
                  >
                    <X size={16} />
                    דחה בקשה
                  </button>
                </form>

                <form action={approveUser.bind(null, profile.id)} className="flex-1">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white bg-green-600 hover:bg-green-700 font-bold shadow-md shadow-green-200 transition-all active:scale-95 text-sm"
                  >
                    <Check size={16} />
                    אשר חבר
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
