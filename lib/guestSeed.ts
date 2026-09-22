import { db } from "./firebase";
import { ref, push, set } from "firebase/database";

const DAY = 86400000;

export async function seedGuestDemoData(uid: string) {
  const boardRef = await push(ref(db, `guestBoards/${uid}`), {
    name: "Demo Board",
    createdAt: Date.now(),
  });
  const boardId = boardRef.key!;

  const categories = [
    { name: "Design", color: "#6f6fff" },
    { name: "Development", color: "#54a0ff" },
    { name: "Marketing", color: "#ff9f43" },
    { name: "Bug", color: "#ff6b6b" },
  ];
  for (const c of categories) {
    await push(ref(db, `guestCategories/${uid}`), {
      ...c,
      createdAt: Date.now(),
    });
  }

  const contacts = [
    {
      name: "Lena Hoffmann",
      email: "lena.hoffmann@taskflow.io",
      phone: "+49 151 23456701",
      color: "#6f6fff",
    },
    {
      name: "Jonas Keller",
      email: "jonas.keller@taskflow.io",
      phone: "+49 151 23456702",
      color: "#54a0ff",
    },
    {
      name: "Amelie Roth",
      email: "amelie.roth@taskflow.io",
      phone: "+49 151 23456703",
      color: "#f368e0",
    },
  ];
  for (const c of contacts) {
    await push(ref(db, `guestContacts/${uid}`), {
      ...c,
      createdAt: Date.now(),
    });
  }

  const now = Date.now();
  const tasks = [
    {
      title: "Willkommen bei TaskFlow 👋",
      description:
        "Das hier ist ein Beispiel-Task. Bearbeite ihn, verschiebe ihn per Drag & Drop oder lösche ihn einfach.",
      status: "todo",
      priority: "medium",
      category: "Design",
      assignedTo: ["Lena Hoffmann"],
      dueDate: new Date(now + 2 * DAY).toISOString().slice(0, 10),
      subtasks: [
        { id: crypto.randomUUID(), text: "TaskFlow kennenlernen", done: true },
        { id: crypto.randomUUID(), text: "Eigene Task erstellen", done: false },
      ],
      recurring: "none",
    },
    {
      title: "Landingpage-Redesign umsetzen",
      description:
        "Neues Hero-Layout und Farbschema aus dem Figma-Entwurf in die Startseite übernehmen.",
      status: "todo",
      priority: "medium",
      category: "Design",
      assignedTo: ["Lena Hoffmann", "Amelie Roth"],
      dueDate: new Date(now + 5 * DAY).toISOString().slice(0, 10),
      subtasks: [],
      recurring: "none",
    },
    {
      title: "Drag & Drop auf Mobile reparieren",
      description:
        "Beim Verschieben von Tasks auf Touch-Geräten hängt die Karte manchmal am Finger.",
      status: "todo",
      priority: "urgent",
      category: "Bug",
      assignedTo: ["Jonas Keller"],
      dueDate: new Date(now - 1 * DAY).toISOString().slice(0, 10),
      subtasks: [],
      recurring: "none",
    },
    {
      title: "API-Dokumentation schreiben",
      description:
        "Endpunkte für Tasks, Boards und Kontakte dokumentieren, inklusive Beispielanfragen.",
      status: "progress",
      priority: "medium",
      category: "Development",
      assignedTo: ["Jonas Keller"],
      dueDate: new Date(now + 3 * DAY).toISOString().slice(0, 10),
      subtasks: [
        { id: crypto.randomUUID(), text: "Endpunkte auflisten", done: true },
        { id: crypto.randomUUID(), text: "Beispiele ergänzen", done: false },
      ],
      recurring: "none",
    },
    {
      title: "Kickoff-Call mit neuem Kunden",
      description: "Anforderungen und Zeitplan für das neue Projekt besprechen.",
      status: "progress",
      priority: "urgent",
      category: "Marketing",
      assignedTo: ["Amelie Roth"],
      dueDate: new Date(now + 1 * DAY).toISOString().slice(0, 10),
      subtasks: [],
      recurring: "none",
    },
    {
      title: "Login-Seite: Ladezeit optimieren",
      description: "LCP-Warnung beheben, indem das Logo priorisiert geladen wird.",
      status: "done",
      priority: "medium",
      category: "Bug",
      assignedTo: ["Jonas Keller"],
      dueDate: new Date(now - 2 * DAY).toISOString().slice(0, 10),
      subtasks: [
        { id: crypto.randomUUID(), text: "Ursache finden", done: true },
        { id: crypto.randomUUID(), text: "Fix testen", done: true },
      ],
      recurring: "none",
    },
    {
      title: "Kontaktverwaltung veröffentlichen",
      description: "Neue Kontakte-Seite mit Such- und Filterfunktion live schalten.",
      status: "done",
      priority: "low",
      category: "Development",
      assignedTo: ["Lena Hoffmann"],
      dueDate: new Date(now - 5 * DAY).toISOString().slice(0, 10),
      subtasks: [],
      recurring: "none",
    },
  ] as const;

  let order = 0;
  for (const t of tasks) {
    const taskRef = await push(ref(db, `guestTasks/${uid}`), {
      ...t,
      boardId,
      order: order++,
      createdAt: Date.now(),
    });

    await set(ref(db, `guestTasks/${uid}/${taskRef.key}/activity/init`), {
      type: "system",
      text: "Task erstellt",
      author: "Demo",
      createdAt: Date.now(),
    });
  }
}
