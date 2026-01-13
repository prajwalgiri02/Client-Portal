"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/product-card"

const PRODUCTS = [
  { id: "1", name: "Business Cards - Full Color", price: 49.99 },
  { id: "2", name: "Letterhead - Premium Stock", price: 79.99 },
  { id: "3", name: "Brochures - Tri-fold", price: 129.99 },
  { id: "4", name: "Custom Banners", price: 199.99 },
  { id: "5", name: "Logo Design Package", price: 449.99 },
  { id: "6", name: "Social Media Graphics Set", price: 299.99 },
  { id: "7", name: "Email Campaign Design", price: 159.99 },
  { id: "8", name: "Website Design Consultation", price: 599.99 },
]

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = PRODUCTS.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-0">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-4">Catalog</h1>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching "{searchTerm}"</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
