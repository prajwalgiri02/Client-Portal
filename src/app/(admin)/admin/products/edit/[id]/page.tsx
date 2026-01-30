"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "../../components/ProductForm";
import { productsApi } from "@/lib/api/products";
import { PageLoader } from "@/components/admin-ui";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  // Fetch product data
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProduct(id),
    select: (res: any) => res.data || res,
  });

  if (isLoading) return <PageLoader />;
  if (!data) return <div className="p-8 text-center">Product not found.</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Product</h1>
        <p className="text-muted-foreground text-sm">Update product details, media assets, and order form configuration.</p>
      </div>

      <ProductForm initialData={data} isEdit />
    </div>
  );
}
