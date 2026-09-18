"use client";

import { useAuth } from "@/lib/Context/AuthContext";
import { useBoards } from "@/lib/Context/BoardContext";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Trash2,
  Pencil,
  Search,
  Calendar,
  ChevronDown,
  Trash,
  RotateCcw,
  ListChecks,
  History,
  Send,
  Repeat,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import CategoryPicker, { Category, categoryColor } from "@/components/CategoryPicker";
import SubtaskList, { Subtask } from "@/components/SubtaskList";
import DatePicker from "@/components/DatePicker";

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
  order?: number;
};

type Contact = {
  id: string;
  name: string;
  color: string;
};

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "To Do",
  progress: "In Progress",
  done: "Done",
};

const RECURRING_LABEL: Record<Recurring, string> = {
  none: "Keine",
  daily: "Täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
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

function nextDueDate(dateStr: string, recurring: Recurring) {
  const base = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  if (recurring === "daily") base.setDate(base.getDate() + 1);
  else if (recurring === "weekly") base.setDate(base.getDate() + 7);
  else if (recurring === "monthly") base.setMonth(base.getMonth() + 1);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Board() {
  const { user } = useAuth();
  const { boards, activeBoardId } = useBoards();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "urgent" | "medium" | "low"
  >("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

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
  const [trashOpen, setTrashOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const basePath = (user as any)?.isGuest
    ? `guestTasks/${user?.uid}`
    : `tasks/${user?.uid}`;

  const contactsPath = (user as any)?.isGuest
    ? `guestContacts/${user?.uid}`
    : `contacts/${user?.uid}`;

  const categoriesPath = (user as any)?.isGuest
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

  const getColor = (name: string) =>
    contacts.find((c) => c.name === name)?.color || "#6f6fff";

  const getCategoryColor = (name?: string) => categoryColor(categories, name);

  if (!mounted) {
    return (
      <div className="p-10 min-h-screen bg-background text-foreground">
        Loading…
      </div>
    );
  }

  const boardTasks = tasks.filter(
    (t) => (t.boardId || boards[0]?.id) === activeBoardId
  );

  const trashedTasks = boardTasks
    .filter((t) => t.deletedAt)
    .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));

  const activeTasks = boardTasks.filter((t) => !t.deletedAt);

  const filteredTasks = activeTasks.filter((task) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query);

    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;

    const matchesCategory =
      filterCategory === "all" || task.category === filterCategory;

    const assignedList = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : task.assignedTo
      ? [task.assignedTo]
      : [];
    const matchesAssignee =
      filterAssignee === "all" || assignedList.includes(filterAssignee);

    return matchesSearch && matchesPriority && matchesCategory && matchesAssignee;
  });

  const hasActiveFilters =
    search !== "" ||
    filterPriority !== "all" ||
    filterCategory !== "all" ||
    filterAssignee !== "all";

  function resetFilters() {
    setSearch("");
    setFilterPriority("all");
    setFilterCategory("all");
    setFilterAssignee("all");
  }

  const byOrder = (a: Task, b: Task) => (a.order ?? 0) - (b.order ?? 0);

  const columns = {
    todo: {
      title: "To Do",
      items: filteredTasks.filter((t) => t.status === "todo").sort(byOrder),
    },
    progress: {
      title: "In Progress",
      items: filteredTasks
        .filter((t) => t.status === "progress")
        .sort(byOrder),
    },
    done: {
      title: "Done",
      items: filteredTasks.filter((t) => t.status === "done").sort(byOrder),
    },
  };

  async function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination || !user?.uid) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as Task["status"];
    const statusChanged = task.status !== newStatus;

    const destColumn = activeTasks
      .filter((t) => t.status === newStatus && t.id !== draggableId)
      .sort(byOrder);
    destColumn.splice(destination.index, 0, task);

    const updates: Record<string, any> = {};
    destColumn.forEach((t, i) => {
      updates[`${t.id}/order`] = i;
    });
    if (statusChanged) {
      updates[`${draggableId}/status`] = newStatus;
    }

    await update(ref(db, basePath), updates);

    if (statusChanged) {
      await push(ref(db, `${basePath}/${draggableId}/activity`), {
        type: "system",
        text: `Status geändert: ${STATUS_LABEL[task.status]} → ${STATUS_LABEL[newStatus]}`,
        author: user.displayName,
        createdAt: Date.now(),
      });
    }

    if (
      statusChanged &&
      newStatus === "done" &&
      task.recurring &&
      task.recurring !== "none"
    ) {
      const newTaskRef = await push(ref(db, basePath), {
        title: task.title,
        description: task.description || "",
        assignedTo: task.assignedTo || [],
        dueDate: nextDueDate(task.dueDate || "", task.recurring),
        priority: task.priority,
        category: task.category || "",
        subtasks: (task.subtasks || []).map((s) => ({ ...s, done: false })),
        recurring: task.recurring,
        boardId: task.boardId || activeBoardId,
        status: "todo",
        order: Date.now(),
        createdAt: Date.now(),
      });

      if (newTaskRef.key) {
        await push(ref(db, `${basePath}/${newTaskRef.key}/activity`), {
          type: "system",
          text: "Wiederkehrende Aufgabe automatisch erstellt",
          author: user.displayName,
          createdAt: Date.now(),
        });
      }
    }
  }

  async function deleteTask(id: string) {
    if (!user?.uid) return;
    await update(ref(db, `${basePath}/${id}`), { deletedAt: Date.now() });
  }

  async function restoreTask(id: string) {
    if (!user?.uid) return;
    await update(ref(db, `${basePath}/${id}`), { deletedAt: null });
  }

  async function permanentlyDeleteTask(id: string) {
    if (!user?.uid) return;
    await remove(ref(db, `${basePath}/${id}`));
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

  function toggleSelectMode() {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkMove(status: Task["status"]) {
    if (!user?.uid || selectedIds.size === 0) return;
    await Promise.all(
      [...selectedIds].map((id, i) =>
        update(ref(db, `${basePath}/${id}`), {
          status,
          order: Date.now() + i,
        })
      )
    );
    setSelectedIds(new Set());
  }

  async function bulkDelete() {
    if (!user?.uid || selectedIds.size === 0) return;
    await Promise.all(
      [...selectedIds].map((id) =>
        update(ref(db, `${basePath}/${id}`), { deletedAt: Date.now() })
      )
    );
    setSelectedIds(new Set());
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-primary truncate">
          {boards.find((b) => b.id === activeBoardId)?.name || "Board"}
        </h1>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSelectMode}
            className={`flex items-center gap-2 h-11 px-4 rounded-full border shadow-apple-sm transition-colors duration-200 ease-apple ${
              selectMode
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            {selectMode ? <CheckSquare size={17} /> : <Square size={17} />}
            <span className="text-sm font-medium">
              {selectMode ? "Fertig" : "Auswählen"}
            </span>
          </button>

          <button
            onClick={() => setTrashOpen(true)}
            className="relative flex items-center gap-2 h-11 px-4 rounded-full border border-border bg-card shadow-apple-sm hover:bg-accent transition-colors duration-200 ease-apple"
          >
            <Trash size={17} className="text-muted-foreground" />
            <span className="text-sm font-medium hidden sm:inline">
              Papierkorb
            </span>
            {trashedTasks.length > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                {trashedTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 md:mb-12">
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

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="shrink-0 h-11 rounded-full border border-border bg-card px-4 shadow-apple-sm outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
        >
          <option value="all">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="shrink-0 h-11 rounded-full border border-border bg-card px-4 shadow-apple-sm outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
        >
          <option value="all">Alle Kontakte</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm font-medium text-primary hover:opacity-70 transition-opacity duration-200 ease-apple px-2"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {Object.entries(columns).map(([key, col]) => (
            <Droppable key={key} droppableId={key}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <h2 className="text-2xl font-semibold mb-6">
                    {col.title}{" "}
                    <span className="text-muted-foreground text-base font-normal">
                      ({col.items.length})
                    </span>
                  </h2>

                  <div className="space-y-5">
                    {col.items.map((task, index) => {
                      const assigned = Array.isArray(task.assignedTo)
                        ? task.assignedTo
                        : task.assignedTo
                        ? [task.assignedTo]
                        : [];
                      const overdue = isOverdue(task);

                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={selectMode}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              onClick={() =>
                                selectMode && toggleSelect(task.id)
                              }
                              className={`relative bg-card text-card-foreground border rounded-2xl p-5 shadow-apple-sm hover:shadow-apple-md transition-all duration-300 ease-apple ${
                                selectMode
                                  ? `cursor-pointer ${
                                      selectedIds.has(task.id)
                                        ? "border-primary ring-2 ring-primary/30"
                                        : "border-border"
                                    }`
                                  : "border-border hover:-translate-y-0.5"
                              }`}
                            >
                              {selectMode ? (
                                <div className="absolute top-4 right-4">
                                  {selectedIds.has(task.id) ? (
                                    <CheckSquare
                                      size={20}
                                      className="text-primary"
                                    />
                                  ) : (
                                    <Square
                                      size={20}
                                      className="text-muted-foreground"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="absolute top-4 right-4 flex items-center gap-3">
                                  <button
                                    onClick={() => openEdit(task)}
                                    className="text-muted-foreground hover:text-primary transition-colors duration-200 ease-apple"
                                  >
                                    <Pencil size={17} />
                                  </button>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors duration-200 ease-apple"
                                  >
                                    <Trash2 size={17} />
                                  </button>
                                </div>
                              )}

                              {task.category && (
                                <span
                                  className="text-xs px-3 py-1 rounded-full font-semibold text-white"
                                  style={{
                                    backgroundColor: getCategoryColor(
                                      task.category
                                    ),
                                  }}
                                >
                                  {task.category}
                                </span>
                              )}

                              <h3 className="text-xl font-semibold mt-3 pr-14">
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {task.description}
                                </p>
                              )}

                              {task.dueDate && (
                                <div
                                  className={`flex items-center gap-1.5 mt-3 text-xs font-medium ${
                                    overdue
                                      ? "text-red-500"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  <Calendar size={14} />
                                  {formatDate(task.dueDate)}
                                  {overdue && <span>· Überfällig</span>}
                                  {task.recurring &&
                                    task.recurring !== "none" && (
                                      <Repeat
                                        size={13}
                                        className="text-primary shrink-0"
                                      />
                                    )}
                                </div>
                              )}

                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-muted-foreground">
                                  <ListChecks size={14} />
                                  {task.subtasks.filter((s) => s.done).length}/
                                  {task.subtasks.length} erledigt
                                </div>
                              )}

                              {assigned.length > 0 && (
                                <div className="flex gap-1 mt-4">
                                  {assigned.map((name, i) => (
                                    <div
                                      key={i}
                                      className="h-8 w-8 rounded-full text-white flex items-center justify-center text-sm font-semibold"
                                      style={{
                                        backgroundColor: getColor(name),
                                      }}
                                    >
                                      {name.charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <span
                                className={`inline-block mt-4 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full ${
                                  task.priority === "urgent"
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                    : task.priority === "medium"
                                    ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                    : "bg-green-500/10 text-green-700 dark:text-green-400"
                                }`}
                              >
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {col.items.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Keine Tasks
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {editingTask && (() => {
        const liveTask = tasks.find((t) => t.id === editingTask.id) || editingTask;
        const activityEntries = Object.entries(liveTask.activity || {})
          .map(([id, entry]) => ({ id, ...entry }))
          .sort((a, b) => a.createdAt - b.createdAt);

        return (
        <div
          onClick={closeEdit}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveEdit}
            className="glass-strong p-6 sm:p-8 rounded-3xl w-[560px] max-w-full space-y-6 shadow-apple-xl border border-border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ease-apple"
          >
            <h2 className="text-2xl font-semibold tracking-tight">
              Task bearbeiten
            </h2>

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
              onChange={(iso) =>
                setEditForm((f) => ({ ...f, dueDate: iso }))
              }
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
              isGuest={(user as any)?.isGuest}
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
                    onClick={() => setEditForm((f) => ({ ...f, recurring: r }))}
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
        );
      })()}

      {trashOpen && (
        <div
          onClick={() => setTrashOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-strong p-6 sm:p-8 rounded-3xl w-[560px] max-w-full space-y-5 shadow-apple-xl border border-border max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ease-apple"
          >
            <h2 className="text-2xl font-semibold tracking-tight">
              Papierkorb
            </h2>

            {trashedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Der Papierkorb ist leer.
              </p>
            ) : (
              <div className="space-y-3">
                {trashedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Gelöscht am {formatDate(
                          new Date(task.deletedAt || 0).toISOString()
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => restoreTask(task.id)}
                        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-70 transition-opacity duration-200 ease-apple"
                      >
                        <RotateCcw size={15} /> Wiederherstellen
                      </button>
                      <button
                        onClick={() => permanentlyDeleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors duration-200 ease-apple"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTrashOpen(false)}
                className="px-5 py-2.5 rounded-full border border-border font-medium hover:bg-accent transition-colors duration-200 ease-apple"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-2 sm:gap-3 glass-strong border border-border rounded-2xl sm:rounded-full shadow-apple-xl px-3 py-2 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-200 ease-apple">
          <span className="text-sm font-medium pl-2 sm:pl-3">
            {selectedIds.size} ausgewählt
          </span>

          <select
            onChange={(e) => {
              if (e.target.value) bulkMove(e.target.value as Task["status"]);
              e.target.value = "";
            }}
            defaultValue=""
            className="h-10 rounded-full border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
          >
            <option value="" disabled>
              Verschieben nach…
            </option>
            <option value="todo">To Do</option>
            <option value="progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <button
            onClick={bulkDelete}
            className="h-10 px-4 rounded-full bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors duration-200 ease-apple"
          >
            Löschen
          </button>

          <button
            onClick={toggleSelectMode}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors duration-200 ease-apple"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
