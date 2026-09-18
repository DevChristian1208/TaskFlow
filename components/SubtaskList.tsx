"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export type Subtask = {
  id: string;
  text: string;
  done: boolean;
};

export default function SubtaskList({
  subtasks,
  onChange,
  label = "Subtasks",
}: {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  label?: string;
}) {
  const [newText, setNewText] = useState("");

  const done = subtasks.filter((s) => s.done).length;

  function addSubtask() {
    if (!newText.trim()) return;
    onChange([
      ...subtasks,
      { id: crypto.randomUUID(), text: newText.trim(), done: false },
    ]);
    setNewText("");
  }

  function toggleSubtask(id: string) {
    onChange(
      subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  }

  function removeSubtask(id: string) {
    onChange(subtasks.filter((s) => s.id !== id));
  }

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
        {subtasks.length > 0 && (
          <span className="ml-1.5 text-xs">
            ({done}/{subtasks.length})
          </span>
        )}
      </label>

      <div className="mt-1.5 space-y-1.5">
        {subtasks.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2"
          >
            <input
              type="checkbox"
              checked={s.done}
              onChange={() => toggleSubtask(s.id)}
            />
            <span
              className={`flex-1 text-sm ${
                s.done ? "line-through text-muted-foreground" : ""
              }`}
            >
              {s.text}
            </span>
            <button
              type="button"
              onClick={() => removeSubtask(s.id)}
              className="text-muted-foreground hover:text-destructive transition-colors duration-150 ease-apple"
            >
              <X size={15} />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSubtask();
              }
            }}
            placeholder="Subtask hinzufügen…"
            className="flex-1 h-10 rounded-xl border border-border px-3 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple text-sm"
          />
          <button
            type="button"
            onClick={addSubtask}
            disabled={!newText.trim()}
            className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center hover:bg-accent disabled:opacity-50 transition-colors duration-150 ease-apple"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
