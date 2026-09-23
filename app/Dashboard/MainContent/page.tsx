"use client";

import { useAuth } from "@/lib/Context/AuthContext";
import { useBoards } from "@/lib/Context/BoardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  CirclePlus,
  Flame,
  LoaderCircle,
  BellRing,
  Calendar,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

type Status = "todo" | "progress" | "done";
type Priority = "low" | "medium" | "urgent";

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  deletedAt?: number;
  boardId?: string;
};

function daysUntil(dueDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
}

export default function MainContent() {
  const { user } = useAuth();
  const { boards, activeBoardId } = useBoards();
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [notifPermission, setNotifPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    if (!user?.uid) return;

    const basePath = (user as any).isGuest
      ? `guestTasks/${user.uid}`
      : `tasks/${user.uid}`;

    const tasksRef = ref(db, basePath);

    return onValue(tasksRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRawTasks([]);
        return;
      }

      const data = snapshot.val();
      const loaded = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));

      setRawTasks(loaded);
    });
  }, [user]);

  const tasks = rawTasks.filter(
    (t) => !t.deletedAt && (t.boardId || boards[0]?.id) === activeBoardId
  );

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const progressCount = tasks.filter((t) => t.status === "progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const urgentCount = tasks.filter((t) => t.priority === "urgent").length;
  const mediumCount = tasks.filter((t) => t.priority === "medium").length;
  const lowCount = tasks.filter((t) => t.priority === "low").length;

  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== "done")
    .map((t) => ({ ...t, days: daysUntil(t.dueDate!) }))
    .filter((t) => t.days <= 3)
    .sort((a, b) => a.days - b.days);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPermission("unsupported");
      return;
    }
    setNotifPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (notifPermission !== "granted" || upcomingTasks.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const flagKey = `taskflow_reminder_notified_${today}`;
    if (sessionStorage.getItem(flagKey)) return;

    const overdue = upcomingTasks.filter((t) => t.days < 0).length;
    const dueToday = upcomingTasks.filter((t) => t.days === 0).length;

    if (overdue === 0 && dueToday === 0) return;

    const parts = [];
    if (overdue > 0) parts.push(`${overdue} überfällig`);
    if (dueToday > 0) parts.push(`${dueToday} heute fällig`);

    new Notification("TaskFlow Erinnerung", {
      body: parts.join(" · "),
      icon: "/Taskflow.png",
    });

    sessionStorage.setItem(flagKey, "1");
  }, [notifPermission, upcomingTasks.length]);

  function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    Notification.requestPermission().then(setNotifPermission);
  }

  const cards = [
    {
      title: "To-do",
      value: todoCount,
      iconBg: "bg-primary/10 text-primary",
      icon: (
        <CirclePlus
          onClick={() => router.push("/Dashboard/AddTask")}
          className="h-5 w-5 cursor-pointer"
        />
      ),
    },
    {
      title: "In Progress",
      value: progressCount,
      iconBg: "bg-blue-500/10 text-blue-500",
      icon: <LoaderCircle className="h-5 w-5" />,
    },
    {
      title: "Done",
      value: doneCount,
      iconBg: "bg-green-500/10 text-green-500",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-10 space-y-8 md:space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <GradientText className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
            {greeting}
          </GradientText>

          <p className="mt-1 text-lg text-muted-foreground">
            {user?.displayName}
            {boards.find((b) => b.id === activeBoardId) && (
              <span className="text-muted-foreground/60">
                {" "}
                · {boards.find((b) => b.id === activeBoardId)?.name}
              </span>
            )}
          </p>
        </div>

        {notifPermission === "default" && (
          <button
            onClick={requestNotifications}
            className="flex items-center gap-2 h-11 px-4 rounded-full border border-border bg-card shadow-apple-sm hover:bg-accent transition-colors duration-200 ease-apple text-sm font-medium"
          >
            <BellRing size={16} className="text-primary" />
            Erinnerungen aktivieren
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="bg-card border border-border rounded-2xl shadow-apple-sm hover:shadow-apple-md transition-shadow duration-300 ease-apple"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-muted-foreground font-medium">
                {card.title}
              </CardTitle>
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </CardHeader>

            <CardContent className="text-5xl font-semibold tracking-tight">
              {card.value}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
            <Flame className="h-5 w-5" />
          </div>
          <CardTitle>Priorities</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-4xl font-semibold tracking-tight text-red-500">
                {urgentCount}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Medium</p>
              <p className="text-4xl font-semibold tracking-tight text-yellow-500">
                {mediumCount}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Low</p>
              <p className="text-4xl font-semibold tracking-tight text-green-500">
                {lowCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <CardTitle>Bald fällig</CardTitle>
        </CardHeader>

        <CardContent>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine anstehenden Fälligkeiten in den nächsten Tagen.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3"
                >
                  <span className="font-medium truncate">{t.title}</span>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      t.days < 0
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : t.days === 0
                        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.days < 0
                      ? `Überfällig · ${formatDate(t.dueDate!)}`
                      : t.days === 0
                      ? "Heute fällig"
                      : t.days === 1
                      ? "Morgen fällig"
                      : `In ${t.days} Tagen · ${formatDate(t.dueDate!)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
