"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CONFIG } from "@/lib/config";

type SidebarProps = {
  collapsed: boolean;
};

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const sections: Array<{ title: string; items: Item[] }> = [
  {
    title: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/products", label: "Products", icon: FolderTree },
    ],
  },
  {
    title: "Administration",
    items: [{ to: "/admin/users", label: "Users", icon: Users }],
  },
];

export default function AdminSidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-screen sticky top-0 border-r bg-card flex flex-col",
          "transition-all duration-200 ease-out z-40",
          collapsed ? "w-[72px]" : "w-[280px]",
        )}
      >
        {/* Header (logo) */}
        <div className={cn("h-16 flex items-center px-4 border-b shrink-0", collapsed && "px-3 justify-center")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-lg shadow-lg shadow-primary/20">
              {CONFIG.BRAND_SHORT.charAt(0)}
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <div className="font-bold tracking-wide text-foreground">{CONFIG.BRAND_NAME}</div>
                <div className="text-xs text-muted-foreground font-medium">Admin Panel</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className={cn("px-3 py-4 space-y-4", collapsed && "px-2")}>
            {sections.map((section, i) => (
              <div key={section.title} className="space-y-1">
                {/* Section title */}
                {!collapsed && <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{section.title}</div>}

                {/* Items */}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItem key={item.to} item={item} collapsed={collapsed} pathname={pathname} />
                  ))}
                </div>

                {/* Divider */}
                {i !== sections.length - 1 && <Separator className="my-3 opacity-50" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}

function SidebarItem({ item, collapsed, pathname }: { item: Item; collapsed: boolean; pathname: string }) {
  const Icon = item.icon;
  const isActive = pathname === item.to || pathname.startsWith(item.to + "/");

  const content = (
    <Link
      href={item.to}
      className={cn(
        "group flex items-center gap-3 rounded-lg transition-all duration-200",
        collapsed ? "h-10 w-10 justify-center" : "h-10 px-3",
        isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon size={18} className={cn("shrink-0", isActive ? "stroke-[2.5px]" : "stroke-2")} />

      {!collapsed && <span className={cn("text-sm font-medium flex-1", isActive && "font-semibold")}>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-semibold" sideOffset={10}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
