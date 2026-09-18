"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Check, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { useBoards } from "@/lib/Context/BoardContext";

export default function BoardSwitcher() {
  const { boards, activeBoardId, setActiveBoardId, createBoard, renameBoard, deleteBoard } =
    useBoards();

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setRenamingId(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    await createBoard(newName.trim());
    setNewName("");
    setCreating(false);
    setOpen(false);
  }

  async function handleRename(id: string) {
    if (!renameValue.trim()) return;
    await renameBoard(id, renameValue.trim());
    setRenamingId(null);
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-accent text-accent-foreground font-medium transition-colors duration-200 ease-apple hover:opacity-90"
      >
        <LayoutGrid size={16} className="shrink-0" />
        <span className="flex-1 text-left truncate text-sm">
          {activeBoard?.name || "Board wählen"}
        </span>
        <ChevronDown size={16} className="shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 glass-strong border border-border rounded-2xl shadow-apple-lg z-50 p-2">
          {boards.map((b) => (
            <div
              key={b.id}
              className="group flex items-center gap-2 px-1 rounded-xl hover:bg-accent transition-colors duration-150 ease-apple"
            >
              {renamingId === b.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRename(b.id);
                    }
                  }}
                  onBlur={() => handleRename(b.id)}
                  className="flex-1 h-9 rounded-lg border border-border px-2 my-1 bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveBoardId(b.id);
                    setOpen(false);
                  }}
                  className="flex-1 flex items-center gap-2 px-2 py-2 text-left text-sm"
                >
                  <span className="flex-1 truncate">{b.name}</span>
                  {b.id === activeBoardId && <Check size={15} />}
                </button>
              )}

              {renamingId !== b.id && (
                <div className="hidden group-hover:flex items-center gap-1 pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(b.id);
                      setRenameValue(b.name);
                    }}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <Pencil size={13} />
                  </button>
                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteBoard(b.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {!creating ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl hover:bg-accent text-left text-primary font-medium transition-colors duration-150 ease-apple text-sm"
            >
              <Plus size={15} /> Neues Board
            </button>
          ) : (
            <div className="flex items-center gap-2 p-1 mt-1">
              <input
                autoFocus
                placeholder="Board-Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                className="flex-1 h-9 rounded-lg border border-border px-2 bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
