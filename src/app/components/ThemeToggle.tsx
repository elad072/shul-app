"use client";

import { useTheme } from "@/app/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg 
                 bg-gray-200 dark:bg-gray-700 
                 hover:bg-gray-300 dark:hover:bg-gray-600 
                 transition-colors"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      <span>{theme === "light" ? "מצב כהה" : "מצב בהיר"}</span>
    </button>
  );
}
