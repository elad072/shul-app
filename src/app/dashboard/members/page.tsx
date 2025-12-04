import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import MembersTable from "./members-table";

export default async function MembersPage() {
  const cookieStore = await cookies(); // ← לא async !!! ולא await

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  /* ---------------- FETCH MEMBERS ---------------- */
  const { data: members, error: membersErr } = await supabase
    .from("members")
    .select(`
      *,
      families (
        family_name,
        address
      )
    `)
    .order("created_at", { ascending: false });

  if (membersErr) console.error("Members SELECT Error:", membersErr);

  /* ---------------- FETCH FAMILIES ---------------- */
  const { data: families, error: famErr } = await supabase
    .from("families")
    .select("id, family_name")
    .order("family_name");

  if (famErr) console.error("Families SELECT Error:", famErr);

  /* ---------------- RENDER PAGE ---------------- */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">ניהול חברים</h1>
      </div>

      <MembersTable
        initialMembers={members || []}
        allFamilies={families || []}
      />
    </div>
  );
}
