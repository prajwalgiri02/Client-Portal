"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { PrimaryButton } from "@/components/primary-button"
import { FormInput } from "@/components/form-input"

const PRODUCT_DATA: Record<string, any> = {
  "1": { name: "Business Cards - Full Color", price: 49.99 },
  "2": { name: "Letterhead - Premium Stock", price: 79.99 },
  "3": { name: "Brochures - Tri-fold", price: 129.99 },
  "4": { name: "Custom Banners", price: 199.99 },
  "5": { name: "Logo Design Package", price: 449.99 },
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const product = PRODUCT_DATA[params.id] || { name: "Product", price: 99.99 }
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState("standard")
  const [color, setColor] = useState("black")

  const handleAddToCart = () => {
    router.push("/cart")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-0">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-primary hover:text-orange-600 font-semibold mb-6">
          ← Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
            <span className="text-6xl">▢</span>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-secondary mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">${product.price.toFixed(2)}</p>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Size</label>
                <div className="flex gap-2">
                  {["Small", "Standard", "Large"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s.toLowerCase())}
                      className={`px-4 py-2 border rounded transition-colors ${
                        size === s.toLowerCase()
                          ? "bg-orange-600 hover:bg-orange-700 text-white border-primary"
                          : "border-muted text-secondary hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Color</label>
                <div className="flex gap-3">
                  {["Black", "White", "Blue", "Orange"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c.toLowerCase())}
                      className={`w-10 h-10 rounded border-2 transition-all ${
                        color === c.toLowerCase() ? "border-primary scale-110" : "border-muted"
                      }`}
                      style={{
                        backgroundColor:
                          c === "Black"
                            ? "#000"
                            : c === "White"
                              ? "#fff"
                              : c === "Blue"
                                ? "#3b82f6"
                                : c === "Orange"
                                  ? "#f15a24"
                                  : "#ddd",
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <FormInput
                label="Quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
              />
            </div>

            <PrimaryButton onClick={handleAddToCart}>
              Add to Cart - ${(product.price * quantity).toFixed(2)}
            </PrimaryButton>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
