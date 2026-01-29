"use client";

import * as React from "react";
import { Save, Upload, Plus, Trash2, GripVertical, Settings, Layers, Image as ImageIcon, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Textarea, Select, Toggle, Card, CardHeader, CardTitle, CardContent, useToast } from "@/components/admin-ui";
import { productsApi } from "@/lib/api/products";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Types ---
interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: "image" | "pdf" | "manual" | "spec_sheet";
  order: number;
  previewUrl?: string;
}

interface SpecItem {
  id: string;
  label: string;
  valueType: "text" | "number";
  valueText?: string;
  valueNumber?: number;
  valueUnit?: string;
  order: number;
}

interface OrderField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "radio" | "checkbox" | "file";
  key: string;
  required: boolean;
  helpText: string;
  placeholder: string;
  active: boolean;
  options: any[];
  order: number;
}

export interface ProductData {
  id?: number;
  title: string;
  sku: string;
  active: boolean;
  baseDescription: string;
  media: MediaFile[];
  specs: SpecItem[];
  orderFields: OrderField[];
}

interface ProductFormProps {
  initialData?: ProductData;
  isEdit?: boolean;
}

function SortableSpecItem({ spec, onUpdate, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: spec.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-4 p-4 bg-muted/20 border border-border/50 rounded-lg group hover:bg-muted/40 transition-colors"
    >
      <div {...attributes} {...listeners} className="mt-2 text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <Input
            label="Label"
            value={spec.label}
            onChange={(e) => onUpdate(spec.id, { label: e.target.value })}
            placeholder="Property name..."
            className="h-9"
          />
        </div>
        <div className="md:col-span-3">
          <Select
            label="Type"
            value={spec.valueType}
            onChange={(e: any) => onUpdate(spec.id, { valueType: e.target.value })}
            options={[
              { label: "Text", value: "text" },
              { label: "Number", value: "number" },
            ]}
            className="h-9"
          />
        </div>
        <div className="md:col-span-5">
          <Input
            label="Value"
            value={spec.valueType === "text" ? spec.valueText : spec.valueNumber}
            onChange={(e) =>
              onUpdate(spec.id, spec.valueType === "text" ? { valueText: e.target.value } : { valueNumber: parseFloat(e.target.value) })
            }
            className="h-9"
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(spec.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = React.useState("general");

  const [product, setProduct] = React.useState<ProductData>(
    initialData || {
      title: "",
      sku: "",
      active: true,
      baseDescription: "",
      media: [],
      specs: [],
      orderFields: [],
    },
  );

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data: ProductData) => (isEdit && data.id ? productsApi.updateProduct(data.id, data) : productsApi.createProduct(data)),
    onSuccess: () => {
      success(`Product "${product.title}" ${isEdit ? "updated" : "created"} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ["product", product.id] });
      router.push("/admin/products");
    },
    onError: (err: any) => {
      error(err.message || "An error occurred while saving. Please try again.");
    },
  });

  const handleUpdate = (updates: Partial<ProductData>) => {
    setProduct((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!product.title) {
      error("Product title is required.");
      setActiveTab("general");
      return;
    }
    saveMutation.mutate(product);
  };

  const loading = saveMutation.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Navigation Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-8 border-none shadow-sm h-fit">
          <nav className="p-2 flex flex-col gap-1">
            {[
              { id: "general", label: "General Info", icon: Settings },
              { id: "media", label: "Media Assets", icon: ImageIcon },
              { id: "specs", label: "Specifications", icon: Layers },
              { id: "order", label: "Order Form", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t mt-4 flex flex-col gap-2">
            <Button loading={loading} onClick={handleSave} className="w-full" leftIcon={<Save className="h-4 w-4" />}>
              {isEdit ? "Update Product" : "Save Product"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/products")} className="w-full">
              Cancel
            </Button>
          </div>
        </Card>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {activeTab === "general" && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Product Title"
                value={product.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                placeholder="e.g. Business Cards"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="SKU" value={product.sku} onChange={(e) => handleUpdate({ sku: e.target.value })} placeholder="e.g. BC-001" />
                <div className="pt-8">
                  <Toggle label="Mark as Active" checked={product.active} onChange={(e: any) => handleUpdate({ active: e.target.checked })} />
                </div>
              </div>
              <Textarea
                label="General Description"
                value={product.baseDescription}
                onChange={(e) => handleUpdate({ baseDescription: e.target.value })}
                placeholder="Write a detailed description for this product..."
                rows={6}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "specs" && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
              <CardTitle>Specifications</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleUpdate({
                    specs: [
                      ...product.specs,
                      { id: Math.random().toString(36), label: "", valueType: "text", valueText: "", order: product.specs.length },
                    ],
                  })
                }
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Spec
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (over && active.id !== over.id) {
                    const oldIdx = product.specs.findIndex((s) => s.id === active.id);
                    const newIdx = product.specs.findIndex((s) => s.id === over.id);
                    handleUpdate({ specs: arrayMove(product.specs, oldIdx, newIdx) });
                  }
                }}
              >
                <SortableContext items={product.specs} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {product.specs.map((spec) => (
                      <SortableSpecItem
                        key={spec.id}
                        spec={spec}
                        onUpdate={(id: string, updates: any) =>
                          handleUpdate({ specs: product.specs.map((s) => (s.id === id ? { ...s, ...updates } : s)) })
                        }
                        onRemove={(id: string) => handleUpdate({ specs: product.specs.filter((s) => s.id !== id) })}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        )}

        {activeTab === "media" && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
              <CardTitle>Media Assets</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("media-upload-form")?.click()}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Upload
              </Button>
              <input
                id="media-upload-form"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const newMedia = Array.from(e.target.files).map((f, i) => ({
                      id: Math.random().toString(36),
                      name: f.name,
                      size: f.size,
                      type: f.type.startsWith("image/") ? "image" : ("pdf" as any),
                      order: product.media.length + i,
                      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
                    }));
                    handleUpdate({ media: [...product.media, ...newMedia] });
                  }
                }}
              />
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.media.map((m) => (
                  <div key={m.id} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted/20">
                    {m.previewUrl ? (
                      <img src={m.previewUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-4 flex flex-col items-center justify-center text-xs text-center">
                        <FileText className="h-6 w-6 mb-2" />
                        {m.name}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="danger" size="icon" onClick={() => handleUpdate({ media: product.media.filter((item) => item.id !== m.id) })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "order" && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
              <CardTitle>Order Form Builder</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleUpdate({
                    orderFields: [
                      ...product.orderFields,
                      {
                        id: Math.random().toString(36),
                        label: "New Field",
                        type: "text",
                        key: "new_field",
                        required: false,
                        helpText: "",
                        placeholder: "",
                        active: true,
                        options: [],
                        order: product.orderFields.length,
                      },
                    ],
                  })
                }
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {product.orderFields.map((field) => (
                <div key={field.id} className="p-4 border rounded-xl flex items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        handleUpdate({
                          orderFields: product.orderFields.map((f) =>
                            f.id === field.id ? { ...f, label: e.target.value, key: e.target.value.toLowerCase().replace(/ /g, "_") } : f,
                          ),
                        })
                      }
                    />
                    <Select
                      value={field.type}
                      onChange={(e: any) =>
                        handleUpdate({ orderFields: product.orderFields.map((f) => (f.id === field.id ? { ...f, type: e.target.value } : f)) })
                      }
                      options={[
                        { label: "Text", value: "text" },
                        { label: "Number", value: "number" },
                        { label: "Select", value: "select" },
                      ]}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleUpdate({ orderFields: product.orderFields.filter((f) => f.id !== field.id) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
