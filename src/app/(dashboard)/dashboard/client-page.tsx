"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { productsApi, normalizeList, type Product } from "@/lib/api/products";
import { ProductCard } from "@/components/product-card";
import { QuickActionCard } from "@/components/quick-action-card";
import Link from "next/link";
import { type User } from "@/lib/auth";

interface DashboardClientProps {
  user: User | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: () => productsApi.getProducts({ search: searchTerm }),
    select: (res) => normalizeList<Product>(res),
  });

  // Client-side filtering if the API search is not instant or for better UX on small datasets
  // But since we are passing searchTerm to API, we rely on API filter primarily.
  // However, the user's snippet did client-side filter. Let's stick to API for scalability,
  // or combine if the API returns all. The API function takes 'search' param, so let's trust it.

  // Use a fallback for client name if user is null or name is missing
  const clientName = user?.name || "Valued Client";

  return (
    <div className="max-w-6xl w-full mx-auto space-y-12">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">Welcome, {clientName}</h1>
        <p className="text-muted-foreground">Manage your orders and browse our catalog</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard icon="●" title="Order Products" description="Browse and order from our catalog" href="/catalog" />
        <QuickActionCard icon="↺" title="Reorder Past Items" description="Quickly reorder your previous items" href="/orders" />
        <QuickActionCard icon="□" title="View Orders" description="Check the status of your orders" href="/orders" />
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-bold text-secondary mb-6">Recent Activity</h2>
        <div className="bg-white border border-muted rounded-lg p-8 text-center shadow-sm">
          <p className="text-muted-foreground">No recent orders yet</p>
          <Link href="/catalog" className="text-primary hover:underline font-semibold mt-2 inline-block">
            Start ordering →
          </Link>
        </div>
      </section>

      {/* Product Recommendations */}
      <section>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-4">Product Recommendation For You</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} id={product.id.toString()} name={product.title} price={Number(product.price) || 0} sku={product.sku} />
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching "{searchTerm}"</p>
          </div>
        )}
      </section>
    </div>
  );
}
