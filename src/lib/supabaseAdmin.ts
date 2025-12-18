import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  // Access environment variables INSIDE the function to ensure server-side only execution
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Debug logging - remove after fixing
  console.log('🔍 Checking SUPABASE_SERVICE_ROLE_KEY...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Key exists:', !!supabaseServiceKey);
  console.log('Key preview:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'undefined');

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
      "Please add it to your .env.local file from your Supabase Dashboard > Project Settings > API."
    );
  }

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

