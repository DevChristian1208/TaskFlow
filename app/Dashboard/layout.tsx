"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./Components/Sidebar";
import AccentColorEffect from "@/components/AccentColorEffect";
import { useAuth } from "@/lib/Context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      <AccentColorEffect />
      <DashboardSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border glass px-4 sm:px-8">
          <SidebarTrigger />

          <h1 className="ml-4 font-semibold tracking-tight text-foreground hidden sm:block">
            Dashboard
          </h1>

          <div className="ml-auto relative flex items-center gap-2 sm:gap-3">
            <span className="font-medium text-foreground hidden sm:inline truncate max-w-[160px]">
              {user?.displayName}
            </span>

            <Avatar className="h-10 w-10 shadow-apple-sm shrink-0">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName} />}
              <AvatarFallback className="bg-accent text-accent-foreground">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <button
              onClick={() => setDropDown((p: boolean) => !p)}
              className="rounded-full p-1.5 hover:bg-muted transition-colors duration-200 ease-apple"
            >
              <Image
                src="/keyboard_arrow_down.png"
                alt="arrow"
                width={20}
                height={20}
                className="dark:invert"
              />
            </button>

            {dropDown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropDown(false)}
                />
                <div className="absolute right-0 top-14 z-20 w-56 rounded-2xl border border-border glass-strong p-4 shadow-apple-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl px-3 py-2 text-left text-base font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200 ease-apple"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 min-h-0 w-full overflow-y-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
