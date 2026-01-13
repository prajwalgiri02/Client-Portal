"use client"

import Link from "next/link"

interface HeaderProps {
  clientName?: string
  showLogo?: boolean
}

export function Header({ clientName, showLogo = true }: HeaderProps) {
  return (
    <header className="bg-white border-b border-muted shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {showLogo ? (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="font-semibold text-secondary hidden sm:inline">AC Creative Works</span>
          </Link>
        ) : (
          <div></div>
        )}
        {clientName && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-semibold text-secondary">{clientName}</p>
          </div>
        )}
      </div>
    </header>
  )
}
