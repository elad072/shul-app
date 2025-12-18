"use client";

import { supabase } from "@/lib/supabaseClient";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  variant?: "primary" | "outline";
}

export default function LogoutButton({ className, variant = "primary" }: LogoutButtonProps) {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  const baseStyles = "flex items-center justify-center gap-2 py-2 rounded-xl shadow transition active:scale-95";
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white w-full mt-4",
    outline: "border border-red-200 bg-red-50/50 text-red-600 hover:bg-red-50 px-4"
  };

  return (
    <button
      onClick={logout}
      className={className || `${baseStyles} ${variants[variant]}`}
    >
      <LogOut size={18} />
      <span>התנתק</span>
    </button>
  );
}
