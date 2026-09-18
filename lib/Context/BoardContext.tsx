"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ref, onValue, push, update, remove } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

export type BoardMeta = {
  id: string;
  name: string;
  createdAt: number;
};

type BoardContextType = {
  boards: BoardMeta[];
  activeBoardId: string;
  setActiveBoardId: (id: string) => void;
  createBoard: (name: string) => Promise<void>;
  renameBoard: (id: string, name: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  loading: boolean;
};

const BoardContext = createContext<BoardContextType>({
  boards: [],
  activeBoardId: "",
  setActiveBoardId: () => {},
  createBoard: async () => {},
  renameBoard: async () => {},
  deleteBoard: async () => {},
  loading: true,
});

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [activeBoardId, setActiveBoardIdState] = useState("");
  const [loading, setLoading] = useState(true);
  const attemptedDefaultFor = useRef<string | null>(null);

  const isGuest = (user as any)?.isGuest;
  const boardsPath = isGuest ? `guestBoards/${user?.uid}` : `boards/${user?.uid}`;
  const storageKey = user?.uid ? `taskflow_active_board_${user.uid}` : "";

  useEffect(() => {
    if (!user?.uid) return;

    return onValue(
      ref(db, boardsPath),
      (snapshot) => {
        if (!snapshot.exists()) {
          setBoards([]);
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        const list: BoardMeta[] = Object.keys(data)
          .map((id) => ({ id, ...data[id] }))
          .sort((a, b) => a.createdAt - b.createdAt);

        setBoards(list);
        setLoading(false);

        setActiveBoardIdState((prev) => {
          if (prev && list.some((b) => b.id === prev)) return prev;
          const stored = storageKey ? localStorage.getItem(storageKey) : null;
          if (stored && list.some((b) => b.id === stored)) return stored;
          return list[0]?.id || "";
        });
      },
      (error) => {
        console.error("BoardContext onValue error:", error);
        setLoading(false);
      }
    );
  }, [user, boardsPath, storageKey]);

  useEffect(() => {
    if (!user?.uid || loading || boards.length > 0) return;
    if (attemptedDefaultFor.current === boardsPath) return;

    attemptedDefaultFor.current = boardsPath;

    push(ref(db, boardsPath), {
      name: "Board 1",
      createdAt: Date.now(),
    }).catch((error) => {
      console.error("BoardContext createDefault error:", error);
    });
  }, [user, loading, boards.length, boardsPath]);

  function setActiveBoardId(id: string) {
    setActiveBoardIdState(id);
    if (storageKey) localStorage.setItem(storageKey, id);
  }

  async function createBoard(name: string) {
    if (!user?.uid || !name.trim()) return;
    const newRef = await push(ref(db, boardsPath), {
      name: name.trim(),
      createdAt: Date.now(),
    });
    if (newRef.key) setActiveBoardId(newRef.key);
  }

  async function renameBoard(id: string, name: string) {
    if (!user?.uid || !name.trim()) return;
    await update(ref(db, `${boardsPath}/${id}`), { name: name.trim() });
  }

  async function deleteBoard(id: string) {
    if (!user?.uid || boards.length <= 1) return;
    await remove(ref(db, `${boardsPath}/${id}`));
    const remaining = boards.filter((b) => b.id !== id);
    if (remaining[0]) setActiveBoardId(remaining[0].id);
  }

  return (
    <BoardContext.Provider
      value={{
        boards,
        activeBoardId,
        setActiveBoardId,
        createBoard,
        renameBoard,
        deleteBoard,
        loading,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoards() {
  return useContext(BoardContext);
}
