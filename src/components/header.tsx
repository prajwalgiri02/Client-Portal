"use client";

import Link from "next/link";
import { CONFIG } from "@/lib/config";

interface HeaderProps {
  clientName?: string;
  showLogo?: boolean;
}

export function Header({ clientName, showLogo = true }: HeaderProps) {
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

        <div className="flex items-center gap-6">
          {clientName ? (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Logged in as</p>
              <p className="font-bold text-gray-900">{clientName}</p>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors px-4 py-2">
              Sign In
            </Link>
          )}

          {!clientName && (
            <Link
              href="/register"
              className="hidden md:flex px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/10 items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
