"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="relative grid grid-cols-2 rounded-full bg-muted p-1">
      <span
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-full bg-card shadow-apple-sm transition-transform duration-300 ease-apple ${
          isDark ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
        }`}
      />

      <button
        onClick={() => setTheme("light")}
        className={`relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors duration-200 ease-apple ${
          !isDark ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <Sun size={14} /> Light
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors duration-200 ease-apple ${
          isDark ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <Moon size={14} /> Dark
      </button>
    </div>
  );
}
