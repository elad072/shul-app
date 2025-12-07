"use client";

import { createClient } from "@/utils/supabase/client";

export default function SignOutButton() {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      התנתקות
    </button>
  );
}
