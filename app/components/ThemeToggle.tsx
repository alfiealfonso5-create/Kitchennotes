"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const KEY = "kitchennote.theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement; // <html>

  // Remove both first
  root.classList.remove("dark", "light");

  // Add the active one
  root.classList.add(theme); // "dark" OR "light"
}


export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark"); // default dark

  useEffect(() => {
    // Load saved theme or fall back to system preference
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? null;
    const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    const initial: Theme = saved ?? (systemPrefersDark ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-300
                 border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50
                 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
