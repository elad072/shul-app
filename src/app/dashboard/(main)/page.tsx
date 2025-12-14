import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Image from "next/image";
import {
  Bell,
  Calendar,
  MapPin,
} from "lucide-react";

import { getCurrentHebrewInfo, formatGregorianDate } from "@/lib/hebrewUtils";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hebrewInfo = getCurrentHebrewInfo();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: communityEvents } = await supabase
    .from("community_events")
    .select("*")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(3);

  const { data: personalEvents } = await supabase
    .from("personal_events")
    .select("*")
    .eq("created_by", user.id)
    .gte("gregorian_date", new Date().toISOString())
    .order("gregorian_date", { ascending: true })
    .limit(3);

  return (
    <div className="space-y-10">

      {/* ===== Header ===== */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border shadow-sm">
            <Image src="/logo.png" alt="לוגו" fill />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              שלום, {profile?.first_name} 👋
            </h1>
            <p className="text-sm text-slate-500">
              {hebrewInfo.dateString} · פרשת {hebrewInfo.parasha}
            </p>
          </div>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border shadow-sm text-center">
          <p className="text-sm text-slate-400">היום</p>
          <p className="font-bold text-blue-700">
            {hebrewInfo.gregorianDate}
          </p>
        </div>
      </header>

      {/* ===== Announcements ===== */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-bold text-lg text-slate-800">
          <Bell size={18} className="text-blue-600" />
          לוח מודעות
        </h2>

        {announcements?.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-slate-400">
            אין הודעות חדשות
          </div>
        )}

        <div className="grid gap-4">
          {announcements?.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl p-5 border shadow-sm ${
                a.is_pinned
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-slate-200"
              }`}
            >
              {a.is_pinned && (
                <span className="text-xs font-bold text-orange-700 mb-1 block">
                  📌 נעוץ
                </span>
              )}
              <h3 className="font-bold text-slate-800">{a.title}</h3>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                {a.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Events ===== */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-bold text-lg text-slate-800">
          <Calendar size={18} className="text-green-600" />
          אירועים קרובים
        </h2>

        {communityEvents?.length === 0 && personalEvents?.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-slate-400">
            אין אירועים קרובים
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {communityEvents?.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl p-4 border shadow-sm flex gap-4"
            >
              <div className="bg-green-50 text-green-700 rounded-xl px-3 py-2 text-center min-w-[60px]">
                <div className="text-lg font-bold">
                  {new Date(ev.start_time).getDate()}
                </div>
                <div className="text-xs">
                  {new Date(ev.start_time).toLocaleString("he-IL", {
                    month: "short",
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">{ev.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin size={10} />
                  {ev.location || "בית הכנסת"}
                </p>
              </div>
            </div>
          ))}

          {personalEvents?.map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-50 rounded-2xl p-4 border"
            >
              <span className="text-xs font-bold text-blue-600">
                {ev.event_type === "birthday" ? "🎂 יום הולדת" : "📅 אירוע"}
              </span>
              <p className="font-bold text-slate-800 mt-1">
                {ev.description}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatGregorianDate(ev.gregorian_date)}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
