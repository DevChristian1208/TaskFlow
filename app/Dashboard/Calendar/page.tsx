"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/Context/AuthContext";
import { useBoards } from "@/lib/Context/BoardContext";
import { db } from "@/lib/firebase";
import { ref, onValue, update, push } from "firebase/database";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { WEEKDAYS, buildGrid, sameDay, toIso } from "@/lib/calendarUtils";
import CategoryPicker, {
  Category,
  categoryColor,
} from "@/components/CategoryPicker";
import SubtaskList, { Subtask } from "@/components/SubtaskList";
import DatePicker from "@/components/DatePicker";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Inbox,
  ChevronDown,
  History,
  Send,
  Repeat,
  Trash2,
} from "lucide-react";

type ActivityEntry = {
  type: "comment" | "system";
  text: string;
  author: string;
  createdAt: number;
};

type Recurring = "none" | "daily" | "weekly" | "monthly";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "urgent" | "medium" | "low";
  category?: string;
  assignedTo?: string | string[];
  dueDate?: string;
  status: "todo" | "progress" | "done";
  subtasks?: Subtask[];
  deletedAt?: number;
  activity?: Record<string, ActivityEntry>;
  recurring?: Recurring;
  boardId?: string;
};

type Contact = {
  id: string;
  name: string;
  color: string;
};

type EditForm = {
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: string;
  priority: "urgent" | "medium" | "low";
  category: string;
  subtasks: Subtask[];
  recurring: Recurring;
};

const RECURRING_LABEL: Record<Recurring, string> = {
  none: "Keine",
  daily: "Täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
};

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { boards, activeBoardId } = useBoards();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "urgent" | "medium" | "low"
  >("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    assignedTo: [],
    dueDate: "",
    priority: "urgent",
    category: "",
    subtasks: [],
    recurring: "none",
  });
  const [editAssignedOpen, setEditAssignedOpen] = useState(false);
  const editAssignedRef = useRef<HTMLDivElement>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => setMounted(true), []);

  const isGuest = (user as any)?.isGuest;
  const basePath = isGuest ? `guestTasks/${user?.uid}` : `tasks/${user?.uid}`;
  const contactsPath = isGuest
    ? `guestContacts/${user?.uid}`
    : `contacts/${user?.uid}`;
  const categoriesPath = isGuest
    ? `guestCategories/${user?.uid}`
    : `categories/${user?.uid}`;

  useEffect(() => {
    if (!user?.uid) return;

    const unsubTasks = onValue(ref(db, basePath), (snapshot) => {
      if (!snapshot.exists()) {
        setTasks([]);
        return;
      }
      const data = snapshot.val();
      setTasks(Object.keys(data).map((id) => ({ id, ...data[id] })));
    });

    const unsubContacts = onValue(ref(db, contactsPath), (snapshot) => {
      if (!snapshot.exists()) {
        setContacts([]);
        return;
      }
      const data = snapshot.val();
      setContacts(Object.keys(data).map((id) => ({ id, ...data[id] })));
    });

    const unsubCategories = onValue(ref(db, categoriesPath), (snapshot) => {
      if (!snapshot.exists()) {
        setCategories([]);
        return;
      }
      const data = snapshot.val();
      setCategories(Object.keys(data).map((id) => ({ id, ...data[id] })));
    });

    return () => {
      unsubTasks();
      unsubContacts();
      unsubCategories();
    };
  }, [user, basePath, contactsPath, categoriesPath]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        editAssignedRef.current &&
        !editAssignedRef.current.contains(e.target as Node)
      )
        setEditAssignedOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!mounted) {
    return (
      <div className="p-10 min-h-screen bg-background text-foreground">
        Loading…
      </div>
    );
  }

  const boardTasks = tasks.filter(
    (t) => !t.deletedAt && (t.boardId || boards[0]?.id) === activeBoardId
  );

  const visibleTasks = boardTasks.filter((t) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || t.title?.toLowerCase().includes(query);
    const matchesPriority =
      filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const unscheduled = visibleTasks.filter((t) => !t.dueDate);
  const cells = buildGrid(viewMonth);
  const today = new Date();

  const getColor = (name: string) =>
    contacts.find((c) => c.name === name)?.color || "#6f6fff";
  const getCategoryColor = (name?: string) => categoryColor(categories, name);

  function tasksForDate(date: Date) {
    const iso = toIso(date);
    return visibleTasks.filter((t) => t.dueDate === iso);
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination || !user?.uid) return;

    const task = tasks.find((t) => t.id === result.draggableId);
    if (!task) return;

    const newDate =
      result.destination.droppableId === "unscheduled"
        ? ""
        : result.destination.droppableId;

    if (newDate === (task.dueDate || "")) return;

    await update(ref(db, `${basePath}/${task.id}`), { dueDate: newDate });

    await push(ref(db, `${basePath}/${task.id}/activity`), {
      type: "system",
      text: newDate
        ? `Fälligkeitsdatum geändert${
            task.dueDate ? ` (vorher ${task.dueDate})` : ""
          }: ${newDate}`
        : "Fälligkeitsdatum entfernt",
      author: user.displayName,
      createdAt: Date.now(),
    });
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      assignedTo: Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
        ? [task.assignedTo]
        : [],
      dueDate: task.dueDate || "",
      priority: task.priority,
      category: task.category || "",
      subtasks: task.subtasks || [],
      recurring: task.recurring || "none",
    });
  }

  function closeEdit() {
    setEditingTask(null);
    setEditAssignedOpen(false);
    setCommentText("");
  }

  function toggleEditAssigned(name: string) {
    setEditForm((f) => ({
      ...f,
      assignedTo: f.assignedTo.includes(name)
        ? f.assignedTo.filter((n) => n !== name)
        : [...f.assignedTo, name],
    }));
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid || !editingTask) return;

    await update(ref(db, `${basePath}/${editingTask.id}`), {
      title: editForm.title,
      description: editForm.description,
      assignedTo: editForm.assignedTo,
      dueDate: editForm.dueDate,
      priority: editForm.priority,
      category: editForm.category,
      subtasks: editForm.subtasks,
      recurring: editForm.recurring,
    });

    await push(ref(db, `${basePath}/${editingTask.id}/activity`), {
      type: "system",
      text: "Task bearbeitet",
      author: user.displayName,
      createdAt: Date.now(),
    });

    closeEdit();
  }

  async function deleteTask(id: string) {
    if (!user?.uid) return;
    await update(ref(db, `${basePath}/${id}`), { deletedAt: Date.now() });
    closeEdit();
  }

  async function addComment() {
    if (!user?.uid || !editingTask || !commentText.trim()) return;

    await push(ref(db, `${basePath}/${editingTask.id}/activity`), {
      type: "comment",
      text: commentText.trim(),
      author: user.displayName,
      createdAt: Date.now(),
    });

    setCommentText("");
  }

  const liveTask = editingTask
    ? tasks.find((t) => t.id === editingTask.id) || editingTask
    : null;
  const activityEntries = liveTask
    ? Object.entries(liveTask.activity || {})
        .map(([id, entry]) => ({ id, ...entry }))
        .sort((a, b) => a.createdAt - b.createdAt)
    : [];

  function TaskChip({ task }: { task: Task }) {
    return (
      <div
        onClick={() => openEdit(task)}
        className="text-xs px-2 py-1.5 rounded-lg truncate cursor-pointer font-medium hover:opacity-80 transition-opacity duration-150 ease-apple"
        style={{
          backgroundColor: task.category
            ? `${getCategoryColor(task.category)}26`
            : "var(--muted)",
          color: task.category ? getCategoryColor(task.category) : undefined,
        }}
        title={task.title}
      >
        {task.title}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-primary truncate">
          {boards.find((b) => b.id === activeBoardId)?.name || "Kalender"}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
              )
            }
            className="h-10 w-10 rounded-full border border-border bg-card shadow-apple-sm hover:bg-accent flex items-center justify-center transition-colors duration-200 ease-apple"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="font-semibold capitalize min-w-[140px] text-center">
            {viewMonth.toLocaleDateString("de-DE", {
              month: "long",
              year: "numeric",
            })}
          </span>

          <button
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
              )
            }
            className="h-10 w-10 rounded-full border border-border bg-card shadow-apple-sm hover:bg-accent flex items-center justify-center transition-colors duration-200 ease-apple"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setViewMonth(new Date())}
            className="h-10 px-4 rounded-full border border-border bg-card shadow-apple-sm hover:bg-accent text-sm font-medium transition-colors duration-200 ease-apple"
          >
            Heute
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tasks durchsuchen…"
            className="w-full h-11 rounded-full border border-border bg-card pl-10 pr-4 shadow-apple-sm outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
          />
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="shrink-0 h-11 rounded-full border border-border bg-card px-4 shadow-apple-sm outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
        >
          <option value="all">Alle Prioritäten</option>
          <option value="urgent">Urgent</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <Droppable droppableId="unscheduled">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-2xl border border-border bg-card p-4 shadow-apple-sm h-fit transition-colors duration-150 ease-apple ${
                  snapshot.isDraggingOver ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground">
                  <Inbox size={15} /> Ohne Datum ({unscheduled.length})
                </div>

                <div className="space-y-2 min-h-[40px]">
                  {unscheduled.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskChip task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                const iso = toIso(cell.date);
                const dayTasks = tasksForDate(cell.date);
                const isToday = sameDay(cell.date, today);
                const visible = dayTasks.slice(0, 3);
                const overflow = dayTasks.length - visible.length;

                return (
                  <Droppable droppableId={iso} key={iso}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[92px] sm:min-h-[110px] rounded-xl border p-1.5 transition-colors duration-150 ease-apple ${
                          !cell.inMonth
                            ? "border-transparent bg-transparent"
                            : "border-border bg-card"
                        } ${snapshot.isDraggingOver ? "bg-accent" : ""}`}
                      >
                        <span
                          className={`text-xs font-medium inline-flex h-5 w-5 items-center justify-center rounded-full ${
                            !cell.inMonth
                              ? "text-muted-foreground/30"
                              : isToday
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>

                        <div className="mt-1 space-y-1">
                          {visible.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TaskChip task={task} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {overflow > 0 && (
                            <p className="text-[11px] text-muted-foreground px-2">
                              +{overflow} weitere
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </div>
        </div>
      </DragDropContext>

      {editingTask && (
        <div
          onClick={closeEdit}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveEdit}
            className="glass-strong p-6 sm:p-8 rounded-3xl w-[560px] max-w-full space-y-6 shadow-apple-xl border border-border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ease-apple"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">
                Task bearbeiten
              </h2>
              <button
                type="button"
                onClick={() => deleteTask(editingTask.id)}
                className="text-muted-foreground hover:text-destructive transition-colors duration-200 ease-apple"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Title*
              </label>
              <input
                required
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1.5 w-full h-11 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-1.5 w-full h-24 rounded-2xl border border-border px-4 py-3 bg-background resize-none outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
              />
            </div>

            <div ref={editAssignedRef} className="relative">
              <label className="text-sm font-medium text-muted-foreground">
                Assigned to
              </label>

              <div
                onClick={() => setEditAssignedOpen((v) => !v)}
                className="mt-1.5 w-full h-11 rounded-2xl border border-border px-4 flex items-center justify-between cursor-pointer bg-background"
              >
                <span>
                  {editForm.assignedTo.length === 0
                    ? "Select contacts"
                    : editForm.assignedTo.join(", ")}
                </span>
                <ChevronDown className="text-muted-foreground" size={18} />
              </div>

              {editAssignedOpen && (
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
                          checked={editForm.assignedTo.includes(c.name)}
                          onChange={() => toggleEditAssigned(c.name)}
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

            <DatePicker
              value={editForm.dueDate}
              onChange={(iso) => setEditForm((f) => ({ ...f, dueDate: iso }))}
              label="Due Date"
            />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Priority
              </label>
              <div className="mt-1.5 flex gap-1 p-1 rounded-full bg-muted">
                {(["urgent", "medium", "low"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, priority: p }))}
                    className={`flex-1 h-9 rounded-full font-semibold capitalize text-sm transition-all duration-200 ease-apple ${
                      editForm.priority === p
                        ? p === "urgent"
                          ? "bg-red-500 text-white shadow-apple-sm"
                          : p === "medium"
                          ? "bg-yellow-400 text-black shadow-apple-sm"
                          : "bg-green-500 text-white shadow-apple-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <CategoryPicker
              userId={user?.uid}
              isGuest={isGuest}
              value={editForm.category}
              onChange={(name) =>
                setEditForm((f) => ({ ...f, category: name }))
              }
              label="Category"
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
                    onClick={() =>
                      setEditForm((f) => ({ ...f, recurring: r }))
                    }
                    className={`flex-1 h-9 rounded-full font-medium text-xs transition-all duration-200 ease-apple ${
                      editForm.recurring === r
                        ? "bg-primary text-primary-foreground shadow-apple-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {RECURRING_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>

            <SubtaskList
              subtasks={editForm.subtasks}
              onChange={(subtasks) =>
                setEditForm((f) => ({ ...f, subtasks }))
              }
            />

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <History size={14} /> Aktivität
              </label>

              <div className="mt-1.5 space-y-2 max-h-56 overflow-y-auto pr-1">
                {activityEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Noch keine Aktivität.
                  </p>
                )}

                {activityEntries.map((entry) =>
                  entry.type === "comment" ? (
                    <div
                      key={entry.id}
                      className="rounded-xl bg-muted px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-medium text-foreground">
                          {entry.author}
                        </span>
                        <span>{formatDateTime(entry.createdAt)}</span>
                      </div>
                      <p className="text-sm">{entry.text}</p>
                    </div>
                  ) : (
                    <div
                      key={entry.id}
                      className="flex items-center gap-2 text-xs text-muted-foreground px-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                      <span className="truncate">{entry.text}</span>
                      <span className="shrink-0">
                        · {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addComment();
                    }
                  }}
                  placeholder="Kommentar hinzufügen…"
                  className="flex-1 h-10 rounded-xl border border-border px-3 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple text-sm"
                />
                <button
                  type="button"
                  onClick={addComment}
                  disabled={!commentText.trim()}
                  className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center hover:bg-accent disabled:opacity-50 transition-colors duration-150 ease-apple"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeEdit}
                className="px-5 py-2.5 rounded-full border border-border font-medium hover:bg-accent transition-colors duration-200 ease-apple"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium shadow-apple-sm hover:opacity-90 transition-opacity duration-200 ease-apple"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
