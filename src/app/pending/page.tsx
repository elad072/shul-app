import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    <div style={{ textAlign: "center", padding: "50px", direction: "rtl", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: "50px" }}>⏳</div>
      <h1>בקשתך התקבלה</h1>
      <p>הפרטים נשלחו לאישור הגבאים.</p>
      <p>לא ניתן להיכנס למערכת עד לשינוי הסטטוס.</p>
      
      <form action={logout}>
        <button type="submit" style={{ marginTop: "20px", background: "none", border: "1px solid #ccc", padding: "5px 15px", cursor: "pointer" }}>
          יציאה
        </button>
      </form>
    </div>
  );
}
