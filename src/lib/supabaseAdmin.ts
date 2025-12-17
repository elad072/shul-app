import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
      "Please add it to your .env.local file from your Supabase Dashboard > Project Settings > API."
    );
  }

  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    { auth: { persistSession: false } }
  );
}

// Keep backward compatibility if possible, or refactor consumers.
// Refactoring consumers is safer.
// export const supabaseAdmin = ... // Removing this to force usage of getSupabaseAdmin()

