"use client";

import * as React from "react";
import { Plus, Search, Filter, Trash, Edit, RefreshCw } from "lucide-react";
import {
  Button,
  Input,
  Table,
  Modal,
  ConfirmModal,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumb,
  Select,
} from "../core/index"; // Added /index to be explicit if needed, but relative should work
import { cn } from "@/lib/utils";
import { useToast } from "../feedback/Toast";
import { Product, mockProducts } from "./ExampleData";

import { ProductForm } from "./ProductForm";

type ViewState = "LIST" | "FORM";

export function CRUDDemo() {
  const { success, error } = useToast();
  const [items, setItems] = React.useState<Product[]>(mockProducts);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [view, setView] = React.useState<ViewState>("LIST");

  // States for Dialogs
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Product | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<Product | null>(null);

  // Filter logic
  const filteredItems = items.filter(
    (item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase()),
  );

  const paginatedItems = filteredItems.slice((currentPage - 1) * 5, currentPage * 5);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      success("Data refreshed successfully");
    }, 1000);
  };

  const handleCreateOrUpdate = (data: Partial<Product>) => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      if (editingItem) {
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, ...data } : item)));
        success(`Product "${data.name}" updated successfully`);
      } else {
        const newItem: Product = {
          id: Math.random().toString(36).substring(7),
          name: data.name!,
          category: data.category!,
          price: data.price!,
          stock: data.stock!,
          status: data.status || "active",
        };
        setItems((prev) => [newItem, ...prev]);
        success(`Product "${data.name}" created successfully`);
      }
      setLoading(false);
      setView("LIST");
      setEditingItem(null);
    }, 600);
  };

  const handleDelete = () => {
    if (deletingItem) {
      setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
      success(`Product "${deletingItem.name}" removed from inventory`);
      setIsConfirmOpen(false);
      setDeletingItem(null);
    }
  };

  const breadcrumbItems = [{ label: "Admin", href: "#" }, { label: "Products" }];

  if (view === "FORM") {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6 space-y-1">
          <Breadcrumb items={[...breadcrumbItems, { label: editingItem ? "Edit Product" : "New Product" }]} />
          <h1 className="text-3xl font-bold tracking-tight">{editingItem ? "Edit Product" : "Create New Product"}</h1>
        </div>
        <ProductForm
          initialData={editingItem}
          onSave={handleCreateOrUpdate}
          onCancel={() => {
            setView("LIST");
            setEditingItem(null);
          }}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">Manage your store products, inventory and pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className={loading ? "animate-spin" : ""} />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingItem(null);
              setView("FORM");
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 w-[200px] md:w-[300px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Products Inventory</CardTitle>
                <div className="text-sm text-muted-foreground">{filteredItems.length} Products found</div>
              </div>
            </CardHeader>
            <CardContent>
              <Table
                data={paginatedItems}
                totalItems={filteredItems.length}
                pageSize={5}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                isLoading={loading}
                columns={[
                  {
                    header: "Name",
                    accessorKey: "name",
                    sortable: true,
                    cell: (p: Product) => <div className="font-medium">{p.name}</div>,
                  },
                  { header: "Category", accessorKey: "category" },
                  {
                    header: "Price",
                    accessorKey: "price",
                    cell: (p: Product) => `$${p.price.toFixed(2)}`,
                  },
                  {
                    header: "Stock",
                    accessorKey: "stock",
                    cell: (p: Product) => (
                      <div className="flex items-center gap-2">
                        <span className={cn("w-8 text-right", p.stock < 10 && "text-destructive font-bold")}>{p.stock}</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              p.stock > 50 ? "bg-emerald-500" : p.stock > 10 ? "bg-amber-500" : "bg-destructive",
                            )}
                            style={{ width: `${Math.min(p.stock, 100)}%` }}
                          />
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                    cell: (p: Product) => (
                      <Badge variant={p.status === "active" ? "success" : p.status === "out_of_stock" ? "warning" : "destructive"}>
                        {p.status.replace("_", " ")}
                      </Badge>
                    ),
                  },
                ]}
                onEdit={(item: Product) => {
                  setEditingItem(item);
                  setView("FORM");
                }}
                onDelete={(item: Product) => {
                  setDeletingItem(item);
                  setIsConfirmOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingItem?.name}"?`}
        onConfirm={handleDelete}
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
}
