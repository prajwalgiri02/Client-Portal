"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FolderTree,
  Receipt,
  Table2,
  LineChart,
  FileText,
  MapPin,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      trend: "up",
      icon: DollarSign,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total Products",
      value: "2,350",
      change: "+180 since last week",
      trend: "up",
      icon: ShoppingBag,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Active Users",
      value: "+12,234",
      change: "+19% from last month",
      trend: "up",
      icon: Users,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Churn Rate",
      value: "1.2%",
      change: "-0.4% from last month",
      trend: "down",
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  const quickLinks = [
    { label: "Products", href: "/admin/products", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: Receipt },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Vendors", href: "/admin/vendors", icon: Table2 },
    { label: "Addresses", href: "/admin/addresses", icon: MapPin },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Reports", href: "#", icon: LayoutDashboard }, // Keeping Reports as placeholder
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-xl`}>
                <stat.icon size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {stat.trend === "up" ? <ArrowUpRight size={14} className="text-green-600" /> : <ArrowDownRight size={14} className="text-red-600" />}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
              <div className="text-center">
                <LayoutDashboard size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">Activity Chart Placeholder</p>
                <p className="text-xs text-muted-foreground">Detailed analytics will be shown here.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <link.icon size={16} />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
