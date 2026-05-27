import { useEffect, useState } from "react";

const KEY = "ringly-theme";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEY) as "light" | "dark") || "light";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);
  return { theme, setTheme, toggle: () => setTheme(t => t === "light" ? "dark" : "light") };
}
