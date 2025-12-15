import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { approveUser, rejectUser } from "./actions";
import Sidebar from "../../components/dashboard/Sidebar";

export default async function GabbaiApprovalsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // 1. בדיקה שהמשתמש הנוכחי הוא גבאי
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!currentUserProfile?.is_gabbai) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
        <h1>⛔ גישה נדחתה</h1>
        <p>דף זה מיועד לגבאים בלבד.</p>
      </div>
    );
  }

  // 2. שליפת כל המשתמשים הממתינים לאישור
  const { data: pendingUsers } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: "2rem", direction: "rtl", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>🛡️ ניהול אישורי משתמשים</h1>
      
      {pendingUsers?.length === 0 ? (
        <p>אין בקשות ממתינות כרגע 🎉</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {pendingUsers?.map((profile) => (
            <div 
              key={profile.id} 
              className="card"
              style={{ 
                border: "1px solid #ddd", 
                padding: "15px", 
                borderRadius: "8px", 
                background: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{profile.first_name} {profile.last_name}</h3>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  <div>📞 {profile.phone}</div>
                  <div>📧 {profile.email}</div>
                  <div>📅 נרשם ב: {new Date(profile.created_at).toLocaleDateString('he-IL')}</div>
                  {profile.is_gabbai && <div style={{color: "purple", fontWeight: "bold"}}>מבקש הרשאת גבאי</div>}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {/* טופס דחייה */}
                <form action={rejectUser.bind(null, profile.id)}>
                  <button 
                    type="submit"
                    style={{ background: "#ff4d4f", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}
                  >
                    דחה ✕
                  </button>
                </form>

                {/* טופס אישור */}
                <form action={approveUser.bind(null, profile.id)}>
                  <button 
                    type="submit"
                    style={{ background: "#52c41a", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}
                  >
                    אשר ✓
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: "30px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <a href="/dashboard" style={{ color: "blue", textDecoration: "none" }}>← חזרה לדשבורד</a>
      </div>
    </div>
  );
}
