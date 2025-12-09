import { createSupabaseServer } from "@/lib/supabaseServer";

export default async function ServerTest() {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();

  return (
    <pre>{JSON.stringify({ user: data?.user, error }, null, 2)}</pre>
  );
}
