"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { PrimaryButton } from "@/components/primary-button"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const orderNumber = "ACC-2024-001"

  const orderItems = [
    { id: "1", name: "Business Cards - Full Color", quantity: 2, price: 49.99 },
    { id: "3", name: "Brochures - Tri-fold", quantity: 1, price: 129.99 },
  ]

  const subtotal = 229.97
  const tax = 18.4
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-0">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-primary hover:text-orange-600 font-semibold mb-6">
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">Order {orderNumber}</h1>
          <p className="text-muted-foreground">Ordered on January 10, 2024</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white border border-muted rounded-lg p-6">
              <h2 className="font-bold text-secondary text-lg mb-4">Status</h2>
              <div className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-semibold text-secondary">Shipped</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Your order has been shipped and is on its way!</p>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-muted rounded-lg p-6">
              <h2 className="font-bold text-secondary text-lg mb-4">Items</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between pb-4 border-b border-muted last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-secondary">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-muted rounded-lg p-6 sticky top-8">
              <h2 className="font-bold text-secondary text-lg mb-6">Order Summary</h2>

              <div className="space-y-3 pb-6 border-b border-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-secondary">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-secondary">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg pt-6">
                <span className="font-bold text-secondary">Total</span>
                <span className="font-bold text-primary">${total.toFixed(2)}</span>
              </div>

              <PrimaryButton onClick={() => router.push("/catalog")}>Place Similar Order</PrimaryButton>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
