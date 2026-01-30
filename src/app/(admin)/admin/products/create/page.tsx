"use client";

import * as React from "react";
import { ProductForm } from "../components/ProductForm";

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Product</h1>
        <p className="text-muted-foreground text-sm">Add a new product to your catalog with custom fields and media.</p>
      </div>

      <ProductForm />
    </div>
  );
}
