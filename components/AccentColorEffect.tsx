"use client";

import { useEffect } from "react";

export const ACCENT_COLORS = [
  { name: "Indigo", value: "#6f6fff" },
  { name: "Blau", value: "#0A84FF" },
  { name: "Grün", value: "#34C759" },
  { name: "Orange", value: "#FF9F0A" },
  { name: "Pink", value: "#FF375F" },
  { name: "Lila", value: "#AF52DE" },
];

const STORAGE_KEY = "taskflow_accent";

export function applyAccentColor(hex: string) {
  document.documentElement.style.setProperty("--primary", hex);
  document.documentElement.style.setProperty("--sidebar-primary", hex);
  document.documentElement.style.setProperty("--sidebar-ring", `${hex}80`);
  document.documentElement.style.setProperty("--ring", `${hex}80`);
  localStorage.setItem(STORAGE_KEY, hex);
}

export function getStoredAccentColor() {
  if (typeof window === "undefined") return ACCENT_COLORS[0].value;
  return localStorage.getItem(STORAGE_KEY) || ACCENT_COLORS[0].value;
}

export default function AccentColorEffect() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) applyAccentColor(stored);
  }, []);

  return null;
}
