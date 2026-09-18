"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";
import { ref, onValue, push } from "firebase/database";
import { db } from "@/lib/firebase";

export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};

export const CATEGORY_COLORS = [
  "#6f6fff",
  "#ff9f43",
  "#1dd1a1",
  "#54a0ff",
  "#ff6b6b",
  "#f368e0",
  "#00d2d3",
  "#a55eea",
];

export function categoryColor(categories: Category[], name?: string) {
  return categories.find((c) => c.name === name)?.color || "#9ca3af";
}

export default function CategoryPicker({
  userId,
  isGuest,
  value,
  onChange,
  label = "Kategorie",
}: {
  userId?: string;
  isGuest?: boolean;
  value: string;
  onChange: (name: string) => void;
  label?: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const path = isGuest ? `guestCategories/${userId}` : `categories/${userId}`;

  useEffect(() => {
    if (!userId) return;

    return onValue(ref(db, path), (snapshot) => {
      if (!snapshot.exists()) {
        setCategories([]);
        return;
      }
      const data = snapshot.val();
      const list: Category[] = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(list);
    });
  }, [userId, path]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function createCategory() {
    if (!userId || !newName.trim()) return;

    await push(ref(db, path), {
      name: newName.trim(),
      color: newColor,
      createdAt: Date.now(),
    });

    onChange(newName.trim());
    setNewName("");
    setNewColor(CATEGORY_COLORS[0]);
    setCreating(false);
    setOpen(false);
  }

  const selected = categories.find((c) => c.name === value);

  return (
    <div ref={wrapRef} className="relative">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>

      <div
        onClick={() => setOpen((v) => !v)}
        className="mt-1.5 w-full h-11 rounded-2xl border border-border px-4 flex items-center justify-between cursor-pointer bg-card shadow-apple-sm"
      >
        <span className="flex items-center gap-2 truncate">
          {value && (
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: selected?.color || "#9ca3af" }}
            />
          )}
          {value || "Kategorie wählen"}
        </span>
        <ChevronDown className="shrink-0 text-muted-foreground" size={18} />
      </div>

      {open && (
        <div className="absolute mt-2 w-full glass-strong border border-border rounded-2xl shadow-apple-lg z-50 p-2">
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                onChange(c.name);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent text-left transition-colors duration-150 ease-apple"
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="flex-1 truncate">{c.name}</span>
              {value === c.name && <Check size={16} />}
            </button>
          ))}

          {categories.length === 0 && !creating && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Noch keine Kategorien
            </p>
          )}

          {!creating ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent text-left text-primary font-medium transition-colors duration-150 ease-apple"
            >
              <Plus size={16} /> Neue Kategorie
            </button>
          ) : (
            <div className="p-2 space-y-3">
              <input
                autoFocus
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    createCategory();
                  }
                }}
                className="w-full h-10 rounded-xl border border-border px-3 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
              />

              <div className="flex gap-2 flex-wrap">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setNewColor(color)}
                    className="h-7 w-7 rounded-full flex items-center justify-center transition-transform duration-150 ease-apple hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {newColor === color && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                  }}
                  className="px-3 py-1.5 rounded-full border border-border text-sm hover:bg-accent transition-colors duration-150 ease-apple"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={createCategory}
                  disabled={!newName.trim()}
                  className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-50 hover:opacity-90 transition-opacity duration-150 ease-apple"
                >
                  Speichern
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
