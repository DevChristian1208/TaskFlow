// Seeds a TaskFlow account with realistic demo data (categories, contacts,
// tasks) so the board looks populated for portfolio screenshots.
//
// Usage:
//   SEED_EMAIL=you@example.com SEED_PASSWORD=yourpassword node scripts/seedTaskFlowDemo.mjs
//
// Reads Firebase config from .env.local (same NEXT_PUBLIC_FIREBASE_* vars the app uses).

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get, push, set } from "firebase/database";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const path = join(__dirname, "..", ".env.local");
  const content = readFileSync(path, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}

loadEnvLocal();

const email = process.env.SEED_EMAIL;
const password = process.env.SEED_PASSWORD;

if (!email || !password) {
  console.error("Set SEED_EMAIL and SEED_PASSWORD environment variables.");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://dashboard-319b6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const CATEGORIES = [
  { name: "Design", color: "#f368e0" },
  { name: "Development", color: "#6f6fff" },
  { name: "Marketing", color: "#ff9f43" },
  { name: "Bug", color: "#ff6b6b" },
  { name: "Research", color: "#1dd1a1" },
];

const CONTACTS = [
  { name: "Lena Hoffmann", email: "lena.hoffmann@taskflow.io", phone: "+49 151 23456701", color: "#6f6fff" },
  { name: "Marco Weber", email: "marco.weber@taskflow.io", phone: "+49 151 23456702", color: "#ff9f43" },
  { name: "Sofia Bianchi", email: "sofia.bianchi@taskflow.io", phone: "+49 151 23456703", color: "#1dd1a1" },
  { name: "Jonas Keller", email: "jonas.keller@taskflow.io", phone: "+49 151 23456704", color: "#54a0ff" },
  { name: "Amelie Roth", email: "amelie.roth@taskflow.io", phone: "+49 151 23456705", color: "#f368e0" },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function subtasks(...texts) {
  return texts.map((text, i) => ({ id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`, text, done: false }));
}

function doneSubtasks(...texts) {
  return subtasks(...texts).map((s) => ({ ...s, done: true }));
}

function buildTasks(boardId) {
  return [
    {
      title: "Landingpage-Redesign umsetzen",
      description: "Neues Hero-Layout und Farbschema aus dem Figma-Entwurf in die Startseite übernehmen.",
      assignedTo: ["Lena Hoffmann", "Amelie Roth"],
      dueDate: daysFromNow(6),
      priority: "medium",
      category: "Design",
      subtasks: subtasks("Hero-Sektion umsetzen", "Responsive Breakpoints prüfen", "Review mit Design-Team"),
      recurring: "none",
      status: "todo",
    },
    {
      title: "Drag & Drop auf Mobile reparieren",
      description: "Beim Verschieben von Tasks auf Touch-Geräten hängt die Karte manchmal am Finger.",
      assignedTo: ["Jonas Keller"],
      dueDate: daysFromNow(2),
      priority: "urgent",
      category: "Bug",
      subtasks: subtasks("Bug auf iOS reproduzieren", "Touch-Events debuggen", "Fix testen"),
      recurring: "none",
      status: "todo",
    },
    {
      title: "Q3-Marketingkampagne planen",
      description: "Kanäle, Budget und Zeitplan für die Produkteinführung im dritten Quartal festlegen.",
      assignedTo: ["Marco Weber"],
      dueDate: daysFromNow(10),
      priority: "medium",
      category: "Marketing",
      subtasks: subtasks("Zielgruppen definieren", "Budget abstimmen"),
      recurring: "none",
      status: "todo",
    },
    {
      title: "Wöchentliches Team-Standup",
      description: "Kurzer Sync zum Fortschritt der laufenden Sprints.",
      assignedTo: ["Lena Hoffmann", "Marco Weber", "Sofia Bianchi", "Jonas Keller"],
      dueDate: daysFromNow(1),
      priority: "low",
      category: "Development",
      subtasks: [],
      recurring: "weekly",
      status: "todo",
    },
    {
      title: "Nutzerinterviews auswerten",
      description: "Erkenntnisse aus den letzten fünf Nutzerinterviews zusammenfassen und priorisieren.",
      assignedTo: ["Sofia Bianchi"],
      dueDate: daysFromNow(8),
      priority: "low",
      category: "Research",
      subtasks: subtasks("Interviews transkribieren", "Themen clustern", "Bericht schreiben"),
      recurring: "none",
      status: "todo",
    },
    {
      title: "API-Dokumentation schreiben",
      description: "Endpunkte für Tasks, Boards und Kontakte dokumentieren, inklusive Beispielanfragen.",
      assignedTo: ["Jonas Keller"],
      dueDate: daysFromNow(4),
      priority: "medium",
      category: "Development",
      subtasks: [...doneSubtasks("Endpunkte auflisten"), ...subtasks("Beispiele ergänzen", "Review anfordern")],
      recurring: "none",
      status: "progress",
    },
    {
      title: "Kickoff-Call mit neuem Kunden",
      description: "Anforderungen und Zeitplan für das neue Projekt besprechen.",
      assignedTo: ["Amelie Roth", "Marco Weber"],
      dueDate: daysFromNow(3),
      priority: "urgent",
      category: "Marketing",
      subtasks: subtasks("Agenda vorbereiten", "Notizen im CRM ablegen"),
      recurring: "none",
      status: "progress",
    },
    {
      title: "Onboarding-Flow überarbeiten",
      description: "Die ersten drei Schritte nach der Registrierung vereinfachen, um die Abbruchrate zu senken.",
      assignedTo: ["Lena Hoffmann"],
      dueDate: daysFromNow(7),
      priority: "medium",
      category: "Design",
      subtasks: [...doneSubtasks("Aktuellen Flow analysieren"), ...subtasks("Wireframes erstellen", "Prototyp testen")],
      recurring: "none",
      status: "progress",
    },
    {
      title: "Performance-Audit der Dashboard-Seite",
      description: "Ladezeiten messen und die größten Bottlenecks identifizieren.",
      assignedTo: ["Jonas Keller", "Sofia Bianchi"],
      dueDate: daysFromNow(5),
      priority: "low",
      category: "Development",
      subtasks: subtasks("Lighthouse-Report erstellen", "Bottlenecks priorisieren"),
      recurring: "none",
      status: "progress",
    },
    {
      title: "Login-Seite: Logo-Ladezeit optimieren",
      description: "LCP-Warnung behoben, indem das Logo als priorisiertes Bild geladen wird.",
      assignedTo: ["Jonas Keller"],
      dueDate: daysFromNow(-1),
      priority: "medium",
      category: "Bug",
      subtasks: doneSubtasks("Ursache identifizieren", "Fix umsetzen", "In Produktion prüfen"),
      recurring: "none",
      status: "done",
    },
    {
      title: "Kontaktverwaltung veröffentlichen",
      description: "Neue Kontakte-Seite mit Such- und Filterfunktion live geschaltet.",
      assignedTo: ["Lena Hoffmann", "Amelie Roth"],
      dueDate: daysFromNow(-4),
      priority: "medium",
      category: "Development",
      subtasks: doneSubtasks("Suche implementieren", "Filter implementieren", "QA abgeschlossen"),
      recurring: "none",
      status: "done",
    },
    {
      title: "Pitch Deck für Investoren finalisieren",
      description: "Letzte Zahlen und Testimonials in die Präsentation eingearbeitet.",
      assignedTo: ["Amelie Roth"],
      dueDate: daysFromNow(-8),
      priority: "urgent",
      category: "Marketing",
      subtasks: doneSubtasks("Zahlen aktualisieren", "Feedback einarbeiten"),
      recurring: "none",
      status: "done",
    },
  ].map((t, i) => ({ ...t, boardId, order: Date.now() + i, createdAt: Date.now() - (12 - i) * 3600_000 }));
}

async function ensureBoard(uid) {
  const boardsSnap = await get(ref(db, `boards/${uid}`));
  if (boardsSnap.exists()) {
    const data = boardsSnap.val();
    const first = Object.entries(data).sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
    return first[0];
  }
  const newRef = push(ref(db, `boards/${uid}`));
  await set(newRef, { name: "Board 1", createdAt: Date.now() });
  return newRef.key;
}

async function seedCategories(uid) {
  const map = {};
  for (const cat of CATEGORIES) {
    const catRef = push(ref(db, `categories/${uid}`));
    await set(catRef, cat);
    map[cat.name] = catRef.key;
  }
  return map;
}

async function seedContacts(uid) {
  for (const contact of CONTACTS) {
    const contactRef = push(ref(db, `contacts/${uid}`));
    await set(contactRef, { ...contact, createdAt: Date.now() });
  }
}

async function seedTasks(uid, boardId, displayName) {
  for (const task of buildTasks(boardId)) {
    const taskRef = push(ref(db, `tasks/${uid}`));
    await set(taskRef, task);
    const activityRef = push(ref(db, `tasks/${uid}/${taskRef.key}/activity`));
    await set(activityRef, {
      type: "system",
      text: "Task erstellt",
      author: displayName || "User",
      createdAt: Date.now(),
    });
  }
}

async function main() {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  const displayName = credential.user.displayName || "User";

  console.log(`Signed in as ${email} (uid: ${uid})`);

  const boardId = await ensureBoard(uid);
  console.log(`Using board ${boardId}`);

  await seedCategories(uid);
  console.log(`Seeded ${CATEGORIES.length} categories`);

  await seedContacts(uid);
  console.log(`Seeded ${CONTACTS.length} contacts`);

  await seedTasks(uid, boardId, displayName);
  console.log(`Seeded ${buildTasks(boardId).length} tasks`);

  console.log("Done. Open the Dashboard to see the populated board.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
