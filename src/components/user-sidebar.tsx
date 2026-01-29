"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Clock, Settings, LogOut, Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import Cookies from "js-cookie";
import { CONFIG } from "@/lib/config";

const navItems = [
  { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Orders", href: "/orders", icon: ShoppingBag },
  { name: "Order History", href: "/orders/history", icon: Clock },
  { name: "Profile Settings", href: "/profile", icon: Settings },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
      Cookies.remove("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      Cookies.remove("token");
      window.location.href = "/login";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-100"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
              <span className="text-white font-bold italic text-lg">{CONFIG.BRAND_SHORT}</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Client Hub</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 font-medium text-sm transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 lg:hidden" />}
    </>
  );
}
