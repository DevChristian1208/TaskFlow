"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/Context/AuthContext";
import { useBoards } from "@/lib/Context/BoardContext";
import { ref, push, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import CategoryPicker from "@/components/CategoryPicker";
import SubtaskList, { Subtask } from "@/components/SubtaskList";
import DatePicker from "@/components/DatePicker";
import { Repeat } from "lucide-react";

type Recurring = "none" | "daily" | "weekly" | "monthly";

const RECURRING_LABEL: Record<Recurring, string> = {
  none: "Keine",
  daily: "Täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
};

export default function AddTask() {
  const { user } = useAuth();
  const { activeBoardId } = useBoards();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<"urgent" | "medium" | "low">(
    "urgent"
  );
  const [category, setCategory] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [recurring, setRecurring] = useState<Recurring>("none");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dropAssigned, setDropAssigned] = useState(false);

  const refAssigned = useRef<HTMLDivElement>(null);

  type Contact = {
    id: string;
    name: string;
    email: string;
    phone: string;
    color: string;
    createdAt: number;
  };

  const contactsPath = (user as any)?.isGuest
    ? `guestContacts/${user?.uid}`
    : `contacts/${user?.uid}`;

  const tasksPath = (user as any)?.isGuest
    ? `guestTasks/${user?.uid}`
    : `tasks/${user?.uid}`;

  useEffect(() => {
    if (!user?.uid) return;

    return onValue(ref(db, contactsPath), (snapshot) => {
      if (!snapshot.exists()) {
        setContacts([]);
        return;
      }

      const data = snapshot.val();
      const mapped = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));

      setContacts(mapped.sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, [user, contactsPath]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        refAssigned.current &&
        !refAssigned.current.contains(e.target as Node)
      )
        setDropAssigned(false);
    }

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function toggleAssigned(name: string) {
    setAssignedTo((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  async function save() {
    if (!user?.uid) return;

    const taskRef = await push(ref(db, tasksPath), {
      title,
      description,
      assignedTo,
      dueDate: date,
      priority,
      category,
      subtasks,
      recurring,
      boardId: activeBoardId,
      status: "todo",
      order: Date.now(),
      createdAt: Date.now(),
    });

    await push(ref(db, `${tasksPath}/${taskRef.key}/activity`), {
      type: "system",
      text: "Task erstellt",
      author: user.displayName || "User",
      createdAt: Date.now(),
    });

    setTitle("");
    setDescription("");
    setAssignedTo([]);
    setCategory("");
    setSubtasks([]);
    setPriority("urgent");
    setDate("");
    setRecurring("none");

    router.push("/Dashboard/Board");
  }

  return (
    <div className="p-4 sm:p-6 md:p-12 min-h-screen bg-background text-foreground">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
        Add Task
      </h1>
      <p className="text-muted-foreground mb-10">Create a new task</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-8">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Title*
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full h-11 rounded-2xl border border-border bg-card px-4 shadow-apple-sm outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full h-32 rounded-2xl border border-border bg-card px-4 py-3 resize-none shadow-apple-sm outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
            />
          </div>

          <div ref={refAssigned} className="relative">
            <label className="text-sm font-medium text-muted-foreground">
              Assigned to
            </label>

            <div
              onClick={() => setDropAssigned((v) => !v)}
              className="mt-1.5 w-full h-11 rounded-2xl border border-border bg-card px-4 flex items-center justify-between cursor-pointer shadow-apple-sm"
            >
              <span>
                {assignedTo.length === 0
                  ? "Select contacts"
                  : assignedTo.join(", ")}
              </span>
              <ChevronDown className="text-muted-foreground" size={18} />
            </div>

            {dropAssigned && (
              <div className="absolute mt-2 w-full glass-strong border border-border rounded-2xl shadow-apple-lg z-50 p-2">
                {contacts.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    Keine Kontakte erstellt
                  </p>
                ) : (
                  contacts.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent cursor-pointer transition-colors duration-150 ease-apple"
                    >
                      <input
                        type="checkbox"
                        checked={assignedTo.includes(c.name)}
                        onChange={() => toggleAssigned(c.name)}
                      />
                      <div
                        className="h-8 w-8 rounded-full text-white flex items-center justify-center text-sm font-semibold"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <DatePicker value={date} onChange={setDate} label="Due Date*" />

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Priority
            </label>
            <div className="mt-1.5 flex gap-1 p-1 rounded-full bg-muted">
              <button
                type="button"
                onClick={() => setPriority("urgent")}
                className={`flex-1 h-9 rounded-full font-semibold text-sm transition-all duration-200 ease-apple ${
                  priority === "urgent"
                    ? "bg-red-500 text-white shadow-apple-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Urgent
              </button>
              <button
                type="button"
                onClick={() => setPriority("medium")}
                className={`flex-1 h-9 rounded-full font-semibold text-sm transition-all duration-200 ease-apple ${
                  priority === "medium"
                    ? "bg-yellow-400 text-black shadow-apple-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority("low")}
                className={`flex-1 h-9 rounded-full font-semibold text-sm transition-all duration-200 ease-apple ${
                  priority === "low"
                    ? "bg-green-500 text-white shadow-apple-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Low
              </button>
            </div>
          </div>

          <CategoryPicker
            userId={user?.uid}
            isGuest={(user as any)?.isGuest}
            value={category}
            onChange={setCategory}
            label="Category*"
          />

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Repeat size={14} /> Wiederholung
            </label>
            <div className="mt-1.5 flex gap-1 p-1 rounded-full bg-muted">
              {(Object.keys(RECURRING_LABEL) as Recurring[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecurring(r)}
                  className={`flex-1 h-9 rounded-full font-medium text-xs transition-all duration-200 ease-apple ${
                    recurring === r
                      ? "bg-primary text-primary-foreground shadow-apple-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {RECURRING_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          <SubtaskList subtasks={subtasks} onChange={setSubtasks} />
        </div>
      </div>

      <button
        onClick={save}
        className="mt-12 bg-primary hover:opacity-90 text-primary-foreground rounded-full px-8 py-3.5 font-semibold shadow-apple-md transition-opacity duration-200 ease-apple"
      >
        Create Task
      </button>
    </div>
  );
}
