"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/Context/AuthContext";
import { ref, push, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AddTask() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<"urgent" | "medium" | "low">(
    "urgent"
  );
  const [category, setCategory] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dropAssigned, setDropAssigned] = useState(false);
  const [dropCategory, setDropCategory] = useState(false);

  const refAssigned = useRef<HTMLDivElement>(null);
  const refCategory = useRef<HTMLDivElement>(null);

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

      if (
        refCategory.current &&
        !refCategory.current.contains(e.target as Node)
      )
        setDropCategory(false);
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

    await push(ref(db, tasksPath), {
      title,
      description,
      assignedTo,
      dueDate: date,
      priority,
      category,
      status: "todo",
      createdAt: Date.now(),
    });

    setTitle("");
    setDescription("");
    setAssignedTo([]);
    setCategory("");
    setPriority("urgent");
    setDate("");

    router.push("/Dashboard/Board");
  }

  return (
    <div className="p-12 min-h-screen bg-background text-foreground">
      <h1 className="text-4xl font-semibold text-[#6f6fff]">Add Task</h1>
      <p className="text-muted-foreground mb-10">Create a new task</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <label>Title*</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border px-3"
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full h-32 rounded-xl border px-3 py-2 resize-none"
            />
          </div>

          <div ref={refAssigned} className="relative">
            <label>Assigned to</label>

            <div
              onClick={() => setDropAssigned((v) => !v)}
              className="mt-1 w-full h-11 rounded-xl border px-3 flex items-center justify-between cursor-pointer"
            >
              <span>
                {assignedTo.length === 0
                  ? "Select contacts"
                  : assignedTo.join(", ")}
              </span>
              <ChevronDown />
            </div>

            {dropAssigned && (
              <div className="absolute mt-2 w-full bg-white dark:bg-neutral-900 border rounded-2xl shadow-xl z-50 p-2">
                {contacts.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <label>Due Date*</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border px-3"
            />
          </div>

          <div>
            <label>Priority</label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPriority("urgent")}
                className={`flex-1 h-11 rounded-xl font-semibold ${
                  priority === "urgent"
                    ? "bg-red-500 text-white"
                    : "bg-red-500/20 text-red-600"
                }`}
              >
                Urgent
              </button>
              <button
                type="button"
                onClick={() => setPriority("medium")}
                className={`flex-1 h-11 rounded-xl font-semibold ${
                  priority === "medium"
                    ? "bg-yellow-400 text-black"
                    : "bg-yellow-400/20 text-yellow-700"
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority("low")}
                className={`flex-1 h-11 rounded-xl font-semibold ${
                  priority === "low"
                    ? "bg-green-500 text-white"
                    : "bg-green-500/20 text-green-700"
                }`}
              >
                Low
              </button>
            </div>
          </div>

          <div ref={refCategory} className="relative">
            <label>Category*</label>

            <div
              onClick={() => setDropCategory((v) => !v)}
              className="mt-1 w-full h-11 rounded-xl border px-3 flex items-center justify-between cursor-pointer"
            >
              <span>{category ? category : "Select category"}</span>
              <ChevronDown />
            </div>

            {dropCategory && (
              <div className="absolute mt-2 w-full bg-white dark:bg-neutral-900 border rounded-2xl shadow-xl z-50 p-2">
                {["Work", "Personal"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setDropCategory(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-left"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={save}
        className="mt-12 bg-[#6f6fff] hover:bg-[#5e5ee6] text-white rounded-xl px-8 py-3 font-semibold"
      >
        Create Task
      </button>
    </div>
  );
}
