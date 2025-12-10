import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", direction: "rtl", maxWidth: "800px", margin: "0 auto" }}>
      <h1>שלום, {profile?.first_name || user.email}! 👋</h1>
      
      {/* אזור לגבאים בלבד */}
      {profile?.is_gabbai && (
        <div style={{ 
          background: "#e6f7ff", 
          border: "1px solid #91d5ff", 
          padding: "15px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <h3>🛠️ אזור גבאי</h3>
          <p>יש לך הרשאות ניהול.</p>
          <a href="/gabbai/approvals" style={{ 
            display: "inline-block",
            background: "#1890ff", 
            color: "white", 
            padding: "10px 20px", 
            textDecoration: "none", 
            borderRadius: "5px",
            fontWeight: "bold"
          }}>
            ניהול אישורי משתמשים
          </a>
        </div>
      )}

      <div style={{ background: "#f0f0f0", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
        <p><strong>סטטוס חשבון:</strong> {profile?.status === 'approved' ? 'פעיל ✅' : profile?.status}</p>
        <p><strong>סוג חברות:</strong> {profile?.member_type}</p>
      </div>

      <form action={async () => {
        "use server";
        const cookieStore = await cookies();
        const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() } } });
        await supabase.auth.signOut();
        redirect("/sign-in");
      }}>
        <button type="submit" style={{ marginTop: "20px", padding: "10px 20px", background: "red", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }}>
          התנתק
        </button>
      </form>
    </div>
  );
}
