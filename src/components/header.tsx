"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CONFIG } from "@/lib/config";
import { useUser } from "@/hooks/use-user";
import Cookies from "js-cookie";
import { LayoutDashboard, LogOut, User } from "lucide-react";

interface HeaderProps {
  clientName?: string;
  showLogo?: boolean;
}

export function Header({ clientName: propClientName, showLogo = true }: HeaderProps) {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
    router.refresh();
  };

  const clientName = propClientName || user?.name;
  const isAdmin = user?.roles.includes("admin");
  const dashboardHref = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {showLogo ? (
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform group-hover:rotate-6 transition-transform">
              <span className="text-white font-bold italic">{CONFIG.BRAND_SHORT}</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:inline tracking-tight">{CONFIG.BRAND_NAME}</span>
          </Link>
        ) : (
          <div></div>
        )}

        <div className="flex items-center gap-4 sm:gap-6">
          {!isLoading && (
            <>
              {clientName ? (
                <div className="flex items-center gap-4 sm:gap-6">
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary transition-colors px-2 py-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />
                  <div className="text-right hidden xs:block">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Logged in as</p>
                    <p className="font-bold text-gray-900 leading-none">{clientName}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sign Out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors px-4 py-2">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden md:flex px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/10 items-center gap-2 hover:scale-[1.02] active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
