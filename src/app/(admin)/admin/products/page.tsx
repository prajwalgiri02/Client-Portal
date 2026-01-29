"use client";

import * as React from "react";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Table, Badge, Card, CardHeader, CardTitle, CardContent, Breadcrumb, useToast, ConfirmModal } from "@/components/admin-ui";
import { productsApi, normalizeList, type Product } from "@/lib/api/products";

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null);

  // Fetch Products
  const {
    data: products = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts(),
    select: (res) => normalizeList<Product>(res),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => {
      success(`Product "${deletingProduct?.title}" deleted.`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeletingProduct(null);
    },
    onError: (err: any) => {
      error(err.message || "Failed to delete product.");
    },
  });

  const handleDelete = () => {
    if (!deletingProduct) return;
    deleteMutation.mutate(deletingProduct.id);
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter(
      (p) => p.title.toLowerCase().includes(deferredSearch.toLowerCase()) || p.sku?.toLowerCase().includes(deferredSearch.toLowerCase()),
    );
  }, [products, deferredSearch]);

  const loading = isLoading || isRefetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Products" }]} />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm">Create, manage and organize your product catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className={loading ? "animate-spin" : ""} />}>
            Refresh
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/admin/products/create")}>
            New Product
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">Inventory List</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or SKU..."
                className="pl-9 h-9 border-muted-foreground/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table
            data={filteredProducts}
            isLoading={isLoading}
            columns={[
              {
                header: "Product Title",
                accessorKey: "title",
                cell: (p: Product) => (
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{p.title}</span>
                    <span className="text-xs text-muted-foreground">{p.sku || "No SKU"}</span>
                  </div>
                ),
              },
              {
                header: "Category",
                accessorKey: "category",
                cell: (p: Product) => <span className="text-sm">{p.category || "N/A"}</span>,
              },
              {
                header: "Status",
                accessorKey: "active",
                cell: (p: Product) => <Badge variant={p.active ? "success" : "secondary"}>{p.active ? "Active" : "Inactive"}</Badge>,
              },
            ]}
            onEdit={(p: Product) => router.push(`/admin/products/edit/${p.id}`)}
            onDelete={(p: Product) => setDeletingProduct(p)}
          />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
