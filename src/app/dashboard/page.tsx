import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  // בהמשך נוסיף גם members לפי created_by / member_id
  const status = profile?.status ?? "pending_approval";

  const statusView = getStatusView(status);

  return (
    <div className="space-y-6">
      <div className="page-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="page-title mb-1">דשבורד חבר קהילה</h1>
            <p className="page-subtitle mb-0">
              זהו כרטיס החברות שלך בבית הכנסת "מעון קודשך".
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-xs text-slate-500">סטטוס החברות</span>
            {statusView}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <CardField label="שם מלא" value={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "טרם עודכן"} />
          <CardField label="אימייל" value={profile?.email || session.user.email || "טרם עודכן"} />
          <CardField label="טלפון" value={profile?.phone || "טרם עודכן"} />
          <CardField label="תפקיד" value={profile?.role || "member"} />
          <CardField label="סוג חבר" value={profile?.member_type || "israel"} />
          <CardField
            label="גבאי"
            value={profile?.is_gabbai ? "כן, מוגדר כגבאי" : "לא"}
          />
        </div>
      </div>

      {/* מקום עתידי לכרטיסי משפחה / בקשות / הודעות */}
      <div className="page-card">
        <h2 className="text-lg font-semibold mb-2">משימות ובקשות</h2>
        <p className="text-sm text-slate-600">
          בשלב זה אין ממשק מלא למשפחה והודעות. זה יהיה השלב הבא:
          הוספת בני משפחה, שליחת בקשות לגבאים, ניהול עליות, ועוד.
        </p>
      </div>
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-100 rounded-lg px-3 py-2 bg-slate-50/60">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-sm text-slate-900">{value || "—"}</div>
    </div>
  );
}

function getStatusView(status: string) {
  switch (status) {
    case "approved":
      return <span className="badge-green">מאושר</span>;
    case "rejected":
      return <span className="badge-red">נדחה</span>;
    case "pending_approval":
    default:
      return <span className="badge-yellow">ממתין לאישור</span>;
  }
}
