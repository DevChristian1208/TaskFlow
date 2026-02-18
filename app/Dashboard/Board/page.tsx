"use client";

import { useAuth } from "@/lib/Context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "urgent" | "medium" | "low";
  category?: string;
  assignedTo?: string | string[];
  status: "todo" | "progress" | "done";
};

type Contact = {
  id: string;
  name: string;
  color: string;
};

export default function Board() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const basePath = (user as any)?.isGuest
    ? `guestTasks/${user?.uid}`
    : `tasks/${user?.uid}`;

  const contactsPath = (user as any)?.isGuest
    ? `guestContacts/${user?.uid}`
    : `contacts/${user?.uid}`;

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

    return () => {
      unsubTasks();
      unsubContacts();
    };
  }, [user, basePath, contactsPath]);

  const getColor = (name: string) =>
    contacts.find((c) => c.name === name)?.color || "#6f6fff";

  if (!mounted) {
    return (
      <div className="p-10 min-h-screen bg-background text-foreground">
        Loading…
      </div>
    );
  }

  const columns = {
    todo: { title: "To Do", items: tasks.filter((t) => t.status === "todo") },
    progress: {
      title: "In Progress",
      items: tasks.filter((t) => t.status === "progress"),
    },
    done: { title: "Done", items: tasks.filter((t) => t.status === "done") },
  };

  async function handleDragEnd(result: DropResult) {
    if (!result.destination || !user?.uid) return;

    await update(ref(db, `${basePath}/${result.draggableId}`), {
      status: result.destination.droppableId,
    });
  }

  async function deleteTask(id: string) {
    if (!user?.uid) return;
    await remove(ref(db, `${basePath}/${id}`));
  }

  return (
    <div className="p-10 min-h-screen bg-background text-foreground">
      <h1 className="text-5xl font-semibold tracking-tight text-[#6f6fff] mb-12">
        Board
      </h1>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {Object.entries(columns).map(([key, col]) => (
            <Droppable key={key} droppableId={key}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <h2 className="text-2xl font-semibold mb-6">{col.title}</h2>

                  <div className="space-y-5">
                    {col.items.map((task, index) => {
                      const assigned = Array.isArray(task.assignedTo)
                        ? task.assignedTo
                        : task.assignedTo
                        ? [task.assignedTo]
                        : [];

                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              className="relative bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition"
                            >
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="absolute top-3 right-3 text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 size={18} />
                              </button>

                              {task.category && (
                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                    task.category === "Work"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {task.category}
                                </span>
                              )}

                              <h3 className="text-xl font-semibold mt-3">
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {task.description}
                                </p>
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
                                className={`inline-block mt-4 text-sm font-bold px-3 py-1 rounded-full ${
                                  task.priority === "urgent"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
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
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
