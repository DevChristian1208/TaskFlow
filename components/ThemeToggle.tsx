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
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        flex w-full items-center gap-3
        rounded-xl px-3 py-2
        bg-white dark:bg-neutral-800
        text-neutral-900 dark:text-neutral-100
        border border-neutral-200 dark:border-neutral-700
        hover:bg-neutral-100 dark:hover:bg-neutral-700
        transition
      "
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span className="text-sm font-medium">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
