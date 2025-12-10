import { createSupabaseServer } from "@/lib/supabase/server";

export default async function ServerTest() {
  const supabase = createSupabaseServer();

  // בצד שרת משתמשים רק ב־getSession
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  const user = sessionData?.session?.user;

  return (
    <pre>
      {JSON.stringify(
        {
          user,
          sessionError,
        },
        null,
        2
      )}
    </pre>
  );
}
