"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/header"
import { FormInput } from "@/components/form-input"
import { PrimaryButton } from "@/components/primary-button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showLogo={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">AC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">AC Creative Works</h1>
            <p className="text-muted-foreground">Client Portal Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PrimaryButton type="submit" isLoading={isLoading}>
              Sign In
            </PrimaryButton>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Need help?{" "}
            <a href="#" className="text-primary hover:underline font-semibold">
              Contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
