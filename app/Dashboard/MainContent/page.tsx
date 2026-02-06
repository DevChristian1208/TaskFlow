"use client";

import { useAuth } from "@/lib/Context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CirclePlus, Flame } from "lucide-react";
import GradientText from "@/components/GradientText";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

type Status = "todo" | "inProgress" | "done";
type Priority = "low" | "medium" | "urgent";

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "urgent";
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
    const tasksRef = ref(db, `tasks/${user.uid}`);
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
  console.log(tasks);

  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const urgentCount = tasks.filter((task) => task.priority === "urgent").length;

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
      title: "Done",
      value: doneCount,
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Urgent",
      value: urgentCount,
      icon: <Flame className="h-6 w-6 text-red-500" />,
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
            className="
              bg-card
              border border-border
              rounded-2xl
              shadow-sm
              transition
              hover:shadow-md
            "
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>

            <CardContent className="text-center text-5xl font-bold">
              {card.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
