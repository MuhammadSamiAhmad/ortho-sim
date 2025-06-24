"use client";

import type React from "react";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
