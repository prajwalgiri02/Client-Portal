"use client";

import { Bell, Maximize2, Menu, SlidersHorizontal, Search as SearchIcon, User, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { CONFIG } from "@/lib/config";

type TopbarProps = {
  onToggleSidebar?: () => void;
  user: {
    name: string;
    email: string;
  };
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  status?: "Unread" | "New";
  color?: "yellow" | "green" | "blue" | "purple";
};

const demoNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "System Update",
    message: "The server will undergo maintenance at 2:00 AM UTC.",
    time: "10 min ago",
    status: "New",
    color: "purple",
  },
  {
    id: "2",
    title: "New Registration",
    message: "A new client 'Elite Retail' has just registered.",
    time: "1 hour ago",
    status: "Unread",
    color: "green",
  },
];

export default function AdminTopbar({ onToggleSidebar, user }: TopbarProps) {
  const unreadCount = demoNotifications.filter((n) => n.status === "Unread" || n.status === "New").length;

  const handleLogout = async () => {
    try {
      const token = Cookies.get("token");
      await fetch(`${CONFIG.API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      Cookies.remove("token");
      window.location.href = "/login";
    }
  };

  const onToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 sm:px-6 gap-3 shrink-0 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-10 w-10 rounded-xl hover:bg-muted" aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 min-w-0 w-[400px] max-w-[50vw]">
          <div className="relative w-full">
            <Input
              placeholder="Search anything..."
              className="h-10 rounded-xl pl-10 pr-10 bg-muted/50 border-transparent focus:bg-background transition-all"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" title="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center border-2 border-background"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" sideOffset={10} className="w-[360px] p-0 rounded-xl overflow-hidden shadow-2xl border-primary/10">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Notifications</span>
                <Badge variant="secondary" className="text-[10px] h-5">
                  {unreadCount} New
                </Badge>
              </div>
              <button className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider">Mark all read</button>
            </div>

            {/* List */}
            <ScrollArea className="max-h-[380px]">
              {demoNotifications.length > 0 ? (
                demoNotifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl grid place-items-center text-xs font-bold shrink-0",
                          n.color === "yellow" && "bg-yellow-100 text-yellow-700",
                          n.color === "green" && "bg-green-100 text-green-700",
                          n.color === "blue" && "bg-blue-100 text-blue-700",
                          n.color === "purple" && "bg-primary/10 text-primary",
                        )}
                      >
                        {n.title.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold truncate">{n.title}</div>
                          <div className="text-[10px] text-muted-foreground shrink-0 font-medium">{n.time}</div>
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-snug">{n.message}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground italic text-sm">No notifications yet.</div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 border-t bg-muted/10 text-center">
              <button className="text-sm font-bold text-primary hover:underline">View All Activity</button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="h-10 w-10 rounded-xl hidden sm:inline-flex" title="Fullscreen">
          <Maximize2 className="h-5 w-5" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12 rounded-xl px-2 gap-3 hover:bg-muted">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg grid place-items-center text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start gap-0.5">
                <span className="text-sm font-bold leading-none">{user.name}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Admin</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-primary/10">
            <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer font-medium p-2.5">
              <Link href="/admin/profile" className="flex items-center w-full">
                <User className="mr-3 h-4 w-4 text-muted-foreground" />
                Profile Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold cursor-pointer p-2.5 hover:bg-destructive/10">
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
