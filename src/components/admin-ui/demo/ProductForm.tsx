"use client";

import * as React from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button, Input, Select, Textarea, Checkbox, Toggle, Card, CardHeader, CardTitle, CardContent, CardFooter } from "../core";
import { Product } from "./ExampleData";

interface ProductFormProps {
  initialData?: Product | null;
  onSave: (data: Partial<Product>) => void;
  onCancel: () => void;
  loading?: boolean;
}

function LastModifiedDate({ isEditing }: { isEditing: boolean }) {
  const [date, setDate] = React.useState<string | null>(null);
  React.useEffect(() => {
    setDate(new Date().toLocaleDateString());
  }, []);

  return <p className="text-xs text-muted-foreground italic">Last modified: {isEditing ? date || "..." : "Never"}</p>;
}

export function ProductForm({ initialData, onSave, onCancel, loading }: ProductFormProps) {
  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: Partial<Product> = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      status: (formData.get("status") || "active") as Product["status"],
    };

    onSave(data);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to List
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Product Name"
                name="name"
                defaultValue={initialData?.name}
                required
                placeholder="Enter product title..."
                helperText="Give your product a short and descriptive name."
              />
              <Textarea label="Description (Optional)" placeholder="Describe what this product is about..." rows={5} />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  name="category"
                  defaultValue={initialData?.category}
                  options={[
                    { label: "Electronics", value: "Electronics" },
                    { label: "Furniture", value: "Furniture" },
                    { label: "Accessories", value: "Accessories" },
                    { label: "Home", value: "Home" },
                  ]}
                  required
                />
                <Input label="Price ($)" name="price" type="number" step="0.01" defaultValue={initialData?.price} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory & Stock</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="SKU (Stock Keeping Unit)" placeholder="GRP-7821" />
              <Input label="Available Stock" name="stock" type="number" defaultValue={initialData?.stock} required />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Options Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Publish Status"
                name="status"
                defaultValue={initialData?.status || "active"}
                options={[
                  { label: "Active / Published", value: "active" },
                  { label: "Out of Stock", value: "out_of_stock" },
                  { label: "Discontinued", value: "discontinued" },
                ]}
              />
              <div className="pt-2 border-t space-y-4">
                <Toggle label="Feature this product on homepage" />
                <Checkbox label="Allow backorders when out of stock" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-6">
              <LastModifiedDate isEditing={isEditing} />
            </CardFooter>
          </Card>

          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full" type="submit" form="product-form" loading={loading} leftIcon={<Save className="h-4 w-4" />}>
              {isEditing ? "Update Product" : "Save Product"}
            </Button>
            <Button variant="outline" size="md" className="w-full" onClick={onCancel}>
              Discard Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Actual Form wrapper for the submit button to target */}
      <form id="product-form" onSubmit={handleSubmit} className="hidden" />
    </div>
  );
}
