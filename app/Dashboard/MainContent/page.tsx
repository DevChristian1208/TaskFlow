"use client";

import { useAuth } from "@/lib/Context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CirclePlus, Flame, LoaderCircle } from "lucide-react";
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
};

export default function MainContent() {
  const { user } = useAuth();
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const basePath = (user as any).isGuest
      ? `guestTasks/${user.uid}`
      : `tasks/${user.uid}`;

    const tasksRef = ref(db, basePath);

    return onValue(tasksRef, (snapshot) => {
      if (!snapshot.exists()) {
        setTasks([]);
        return;
      }

      const data = snapshot.val();
      const loaded = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));

      setTasks(loaded);
    });
  }, [user]);

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const progressCount = tasks.filter((t) => t.status === "progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const urgentCount = tasks.filter((t) => t.priority === "urgent").length;
  const mediumCount = tasks.filter((t) => t.priority === "medium").length;
  const lowCount = tasks.filter((t) => t.priority === "low").length;

  const cards = [
    {
      title: "To-do",
      value: todoCount,
      icon: (
        <CirclePlus
          onClick={() => router.push("/Dashboard/AddTask")}
          className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-primary transition"
        />
      ),
    },
    {
      title: "In Progress",
      value: progressCount,
      icon: <LoaderCircle className="h-6 w-6 text-blue-500" />,
    },
    {
      title: "Done",
      value: doneCount,
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-10 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <GradientText className="text-5xl font-semibold leading-tight">
            {greeting}
          </GradientText>

          <p className="mt-1 text-lg text-muted-foreground">
            {user?.displayName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="bg-card border border-border rounded-2xl shadow-sm transition hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{card.title}</CardTitle>
              {card.icon}
            </CardHeader>

            <CardContent className="text-center text-5xl font-bold">
              {card.value}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border border-border rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <Flame className="h-6 w-6 text-red-500" />
          <CardTitle>Priorities</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-4xl font-bold text-red-500">{urgentCount}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Medium</p>
              <p className="text-4xl font-bold text-yellow-500">
                {mediumCount}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Low</p>
              <p className="text-4xl font-bold text-green-500">{lowCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
