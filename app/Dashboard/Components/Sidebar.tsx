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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/Context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  Contact,
  KanbanSquare,
  Settings,
  CalendarDays,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BoardSwitcher from "./BoardSwitcher";
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
    { label: "Calendar", href: "/Dashboard/Calendar", icon: CalendarDays },
    { label: "Contacts", href: "/Dashboard/Contacts", icon: Contact },
    { label: "Settings", href: "/Dashboard/Settings", icon: Settings },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border glass">
      <SidebarContent className="flex h-full flex-col justify-between px-4 py-7">
        <div className="flex flex-col items-center gap-6 w-full">
          <Image src="/Taskflow.png" alt="logo" width={148} height={148} />

          <BoardSwitcher />

          <SidebarGroup className="w-full">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ease-apple ${
                          active
                            ? "bg-primary text-primary-foreground shadow-apple-md"
                            : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Link href={item.href}>
                          <Icon className="h-5 w-5" strokeWidth={2.25} />
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

        <div className="rounded-2xl bg-card shadow-apple-sm px-4 py-4 space-y-4">
          <div className="flex items-center gap-3.5">
            <Avatar className="h-11 w-11 shadow-apple-sm">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName} />}
              <AvatarFallback className="text-lg font-semibold bg-accent text-accent-foreground">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col leading-tight min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                {user?.email}
              </p>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
