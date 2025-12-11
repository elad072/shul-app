"use client";

import { supabase } from "@/lib/supabaseClient";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  return (
    <button
      onClick={logout}
      className="w-full flex items-center justify-center gap-2 
                 bg-red-600 hover:bg-red-700 text-white py-2 mt-4 
                 rounded-xl shadow transition"
    >
      <LogOut size={18} />
      התנתק
    </button>
  );
}
