"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./Components/Sidebar";
import { useAuth } from "@/lib/Context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [dropDown, setDropDown] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/Login");
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background px-8">
          <SidebarTrigger />

          <h1 className="ml-4 font-medium text-foreground">Dashboard</h1>

          <div className="ml-auto relative flex items-center gap-2">
            <span className="font-medium text-foreground">
              {user?.displayName}
            </span>

            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-foreground">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <button
              onClick={() => setDropDown((p: boolean) => !p)}
              className="rounded-full p-1 hover:bg-muted transition"
            >
              <Image
                src="/keyboard_arrow_down.png"
                alt="arrow"
                width={22}
                height={22}
                className="invert-0 dark:invert"
              />
            </button>

            {dropDown && (
              <div className="absolute right-0 top-14 w-56 rounded-2xl border border-border bg-card p-4 shadow-2xl">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl px-3 py-2 text-left text-lg font-medium text-destructive hover:bg-muted transition"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
