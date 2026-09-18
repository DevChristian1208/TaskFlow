"use client";

import { useEffect, useState } from "react";
import { UserPlus, Pencil, Trash2, ListTodo, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/Context/AuthContext";
import { useBoards } from "@/lib/Context/BoardContext";
import { ref, push, onValue, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  color: string;
  createdAt: number;
};

type Task = {
  id: string;
  title: string;
  status: "todo" | "progress" | "done";
  priority: "urgent" | "medium" | "low";
  assignedTo?: string | string[];
  deletedAt?: number;
  boardId?: string;
};

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "To Do",
  progress: "In Progress",
  done: "Done",
};

export default function Contacts() {
  const { user } = useAuth();
  const { boards } = useBoards();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const COLORS = [
    "#6f6fff",
    "#ff9f43",
    "#1dd1a1",
    "#54a0ff",
    "#ff6b6b",
    "#f368e0",
    "#00d2d3",
    "#a55eea",
  ];

  const basePath = (user as any)?.isGuest
    ? `guestContacts/${user?.uid}`
    : `contacts/${user?.uid}`;

  const tasksPath = (user as any)?.isGuest
    ? `guestTasks/${user?.uid}`
    : `tasks/${user?.uid}`;

  useEffect(() => {
    if (!user?.uid) return;

    return onValue(ref(db, basePath), (snap) => {
      if (!snap.exists()) {
        setContacts([]);
        setSelectedContact(null);
        setLoading(false);
        return;
      }

      const data = snap.val();
      const list: Contact[] = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));

      list.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(list);

      setSelectedContact((prev) => {
        if (!prev) return list[0] ?? null;

        const updated = list.find((c) => c.id === prev.id);
        return updated ?? list[0] ?? null;
      });
      setLoading(false);
    });
  }, [user, basePath]);

  useEffect(() => {
    if (!user?.uid) return;

    return onValue(ref(db, tasksPath), (snap) => {
      if (!snap.exists()) {
        setTasks([]);
        return;
      }

      const data = snap.val();
      setTasks(Object.keys(data).map((id) => ({ id, ...data[id] })));
    });
  }, [user, tasksPath]);

  const contactTasks = selectedContact
    ? tasks.filter((t) => {
        if (t.deletedAt) return false;
        const assigned = Array.isArray(t.assignedTo)
          ? t.assignedTo
          : t.assignedTo
          ? [t.assignedTo]
          : [];
        return assigned.includes(selectedContact.name);
      })
    : [];

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;

    await push(ref(db, basePath), {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
    });

    setName("");
    setEmail("");
    setPhone("");
    setOpenCreate(false);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid || !selectedContact) return;

    await update(ref(db, `${basePath}/${selectedContact.id}`), {
      name,
      email,
      phone,
      color: selectedContact.color,
    });

    setOpenEdit(false);
  }

  async function deleteContact(id: string) {
    if (!user?.uid) return;
    await remove(ref(db, `${basePath}/${id}`));
    setSelectedContact(null);
    setMobileDetailOpen(false);
  }

  return (
    <div className="h-full w-full overflow-hidden grid lg:grid-cols-[360px_1fr] bg-background">
      <div
        className={`${
          mobileDetailOpen ? "hidden" : "flex"
        } lg:flex border-r border-border bg-card flex-col h-full overflow-hidden`}
      >
        <div className="p-4 sm:p-6 shrink-0">
          <button
            onClick={() => {
              setName("");
              setEmail("");
              setPhone("");
              setOpenCreate(true);
            }}
            className="w-full h-14 rounded-full bg-primary text-primary-foreground text-lg font-medium flex items-center justify-center gap-3 hover:opacity-90 shadow-apple-md transition-opacity duration-200 ease-apple cursor-pointer"
          >
            Add new contact <UserPlus />
          </button>
          {openCreate && (
            <div
              onClick={() => setOpenCreate(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
            >
              <form
                onClick={(e) => e.stopPropagation()}
                className="glass-strong border border-border p-6 sm:p-8 rounded-3xl w-[420px] max-w-[92vw] space-y-4 shadow-apple-xl animate-in fade-in zoom-in-95 duration-200 ease-apple"
                onSubmit={createContact}
              >
                <h2 className="text-2xl font-semibold tracking-tight">
                  Create Contact
                </h2>

                <input
                  required
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />

                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />

                <input
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenCreate(false)}
                    className="px-4 py-2 rounded-full border border-border hover:bg-accent transition-colors duration-200 ease-apple"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-apple-sm hover:opacity-90 transition-opacity duration-200 ease-apple"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
          {openEdit && (
            <div
              onClick={() => setOpenEdit(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
            >
              <form
                onClick={(e) => e.stopPropagation()}
                className="glass-strong border border-border p-6 sm:p-8 rounded-3xl w-[420px] max-w-[92vw] space-y-4 shadow-apple-xl animate-in fade-in zoom-in-95 duration-200 ease-apple"
                onSubmit={saveEdit}
              >
                <h2 className="text-2xl font-semibold tracking-tight">
                  Edit Contact
                </h2>

                <input
                  required
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />

                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />

                <input
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenEdit(false)}
                    className="px-4 py-2 rounded-full border border-border hover:bg-accent transition-colors duration-200 ease-apple"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-apple-sm hover:opacity-90 transition-opacity duration-200 ease-apple"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6">
          {loading ? (
            <p className="text-muted-foreground text-center mt-10">
              Loading...
            </p>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedContact(c);
                  setMobileDetailOpen(true);
                }}
                className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer mb-2 transition-colors duration-200 ease-apple ${
                  selectedContact?.id === c.id
                    ? "bg-accent shadow-apple-sm"
                    : "hover:bg-muted/60"
                }`}
              >
                <div
                  className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-apple-sm"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>

                <div className="overflow-hidden">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {c.email}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={`${
          mobileDetailOpen ? "block" : "hidden"
        } lg:block h-full overflow-y-auto bg-muted/30 p-6 sm:p-8 lg:p-12`}
      >
        {selectedContact && (
          <div className="max-w-xl animate-in fade-in slide-in-from-right-4 duration-300 ease-apple">
            <button
              onClick={() => setMobileDetailOpen(false)}
              className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200 ease-apple"
            >
              <ArrowLeft size={18} /> Zurück
            </button>

            <div className="flex items-center gap-4 sm:gap-6 mb-8">
              <div
                className="h-16 w-16 sm:h-24 sm:w-24 shrink-0 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-semibold text-white shadow-apple-lg"
                style={{ backgroundColor: selectedContact.color }}
              >
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight truncate">
                  {selectedContact.name}
                </h2>

                <div className="flex gap-6 mt-3 text-muted-foreground">
                  <button
                    onClick={() => {
                      setName(selectedContact.name);
                      setEmail(selectedContact.email);
                      setPhone(selectedContact.phone || "");
                      setOpenEdit(true);
                    }}
                    className="flex items-center gap-2 hover:text-foreground transition-colors duration-200 ease-apple"
                  >
                    <Pencil size={18} /> Edit
                  </button>

                  <button
                    onClick={() => deleteContact(selectedContact.id)}
                    className="flex items-center gap-2 text-destructive hover:opacity-70 transition-opacity duration-200 ease-apple"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </p>
                <p className="text-lg">{selectedContact.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-lg">{selectedContact.phone || "—"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ListTodo size={16} /> Zugewiesene Tasks (
                  {contactTasks.length})
                </p>

                {contactTasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Keine Tasks zugewiesen.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contactTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-apple-sm"
                      >
                        <span
                          className={`font-medium truncate min-w-0 ${
                            t.status === "done"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {t.title}
                        </span>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {t.boardId &&
                            boards.find((b) => b.id === t.boardId) && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {boards.find((b) => b.id === t.boardId)?.name}
                              </span>
                            )}
                          <span className="text-xs font-medium text-muted-foreground">
                            {STATUS_LABEL[t.status]}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              t.priority === "urgent"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : t.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                : "bg-green-500/10 text-green-700 dark:text-green-400"
                            }`}
                          >
                            {t.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
