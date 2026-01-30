"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";

import { useQuery } from "@tanstack/react-query";
import { productsApi, normalizeList, type Product } from "@/lib/api/products";

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: () => productsApi.getProducts({ search: searchTerm }),
    select: (res) => normalizeList<Product>(res),
  });

  return (
    <div className="max-w-6xl w-full mx-auto">
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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} id={product.id.toString()} name={product.title} price={Number(product.price) || 0} />
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
