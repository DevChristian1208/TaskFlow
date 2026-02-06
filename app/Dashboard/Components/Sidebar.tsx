"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/Context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  Contact,
  KanbanSquare,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect } from "react";

export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  const menuItems = [
    {
      label: "Dashboard",
      href: "/Dashboard/MainContent",
      icon: LayoutDashboard,
    },
    { label: "Add Task", href: "/Dashboard/AddTask", icon: PlusCircle },
    { label: "Board", href: "/Dashboard/Board", icon: KanbanSquare },
    { label: "Contacts", href: "/Dashboard/Contacts", icon: Contact },
  ];

  return (
    <Sidebar className="border-r bg-[#F5F5F7] dark:bg-neutral-900">
      <SidebarContent className="flex h-full flex-col justify-between px-3 py-6">
        <div className="flex flex-col items-center gap-8">
          <Image src="/Taskflow.png" alt="logo" width={160} height={160} />

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                          active
                            ? "bg-[#6f6fff] text-white"
                            : "text-gray-800 dark:text-gray-200 hover:bg-muted"
                        }`}
                      >
                        <Link href={item.href}>
                          <Icon className="h-6 w-6" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="rounded-2xl bg-card px-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="text-lg font-semibold">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col leading-tight">
              <p className="text-sm font-semibold text-foreground">
                {user?.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
