"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "◇" },
    { href: "/catalog", label: "Catalog", icon: "◆" },
    { href: "/orders", label: "Orders", icon: "▢" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-muted lg:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-4 text-center text-xs sm:text-sm font-medium border-t-2 transition-colors ${
              pathname?.startsWith(item.href)
                ? "border-primary text-primary bg-orange-50"
                : "border-transparent text-muted-foreground hover:text-secondary"
            }`}
          >
            <div className="text-lg mb-1">{item.icon}</div>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
