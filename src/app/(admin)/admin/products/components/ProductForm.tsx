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
      return;
    }
    saveMutation.mutate(product);
  };

  const loading = saveMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Top Header with Actions */}
      <div className="flex items-center justify-between gap-4 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b -mx-6 px-6 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">Product Details</h2>
          <p className="text-xs text-muted-foreground italic">Scroll to edit all sections</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/admin/products")} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSave} leftIcon={<Save className="h-4 w-4" />} className="shadow-lg shadow-primary/20">
            {isEdit ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </div>

      {/* Stacked Sections */}
      <div className="space-y-10 max-w-5xl">
        {/* General Details */}
        <section id="general">
          <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Input
                label="Product Title"
                value={product.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                placeholder="e.g. Business Cards"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="SKU" value={product.sku} onChange={(e) => handleUpdate({ sku: e.target.value })} placeholder="e.g. BC-001" />
                <div className="flex items-end pb-1.5 px-1">
                  <Toggle label="Mark as Active" checked={product.active} onChange={(e: any) => handleUpdate({ active: e.target.checked })} />
                </div>
              </div>
              <Textarea
                label="General Description"
                value={product.baseDescription}
                onChange={(e) => handleUpdate({ baseDescription: e.target.value })}
                placeholder="Write a detailed description for this product..."
                rows={8}
              />
            </CardContent>
          </Card>
        </section>

        {/* Media Assets */}
        <section id="media">
          <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Media Assets
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("media-upload-form")?.click()}
                leftIcon={<Upload className="h-4 w-4" />}
                className="bg-background"
              >
                Upload Files
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {product.media.map((m) => (
                  <div
                    key={m.id}
                    className="relative group aspect-square rounded-xl border-2 border-dashed border-muted bg-muted/10 overflow-hidden flex items-center justify-center"
                  >
                    {m.previewUrl ? (
                      <img src={m.previewUrl} alt={m.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="p-4 flex flex-col items-center justify-center text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                        <FileText className="h-8 w-8 mb-2 opacity-20" />
                        {m.name}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-4">
                      <Button
                        variant="danger"
                        size="icon"
                        className="rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
                        onClick={() => handleUpdate({ media: product.media.filter((item) => item.id !== m.id) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {product.media.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/5">
                    <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No media uploaded yet</p>
                    <button
                      onClick={() => document.getElementById("media-upload-form")?.click()}
                      className="text-xs text-primary font-bold mt-2 hover:underline"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Specifications */}
        <section id="specs">
          <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Specifications
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="bg-background"
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
                Add Row
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
                  <div className="space-y-4">
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
                    {product.specs.length === 0 && (
                      <div className="py-8 text-center text-sm text-muted-foreground italic border border-dashed rounded-lg bg-muted/5">
                        Add technical specs or product properties here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </section>

        {/* Order Form Builder */}
        <section id="order">
          <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Custom Order Fields
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="bg-background"
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
                <div
                  key={field.id}
                  className="p-5 bg-background border border-border/50 rounded-xl flex items-center justify-between gap-6 hover:shadow-md transition-all group"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Field Label"
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
                      label="Input Type"
                      value={field.type}
                      onChange={(e: any) =>
                        handleUpdate({ orderFields: product.orderFields.map((f) => (f.id === field.id ? { ...f, type: e.target.value } : f)) })
                      }
                      options={[
                        { label: "Text Input", value: "text" },
                        { label: "Rich Textarea", value: "textarea" },
                        { label: "Number Input", value: "number" },
                        { label: "Select Dropdown", value: "select" },
                        { label: "Radio Selection", value: "radio" },
                        { label: "Checkbox Toggle", value: "checkbox" },
                        { label: "File Upload", value: "file" },
                      ]}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive mt-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleUpdate({ orderFields: product.orderFields.filter((f) => f.id !== field.id) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {product.orderFields.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground italic border border-dashed rounded-lg bg-muted/5">
                  Define what information the customer needs to provide when ordering
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Bottom Actions */}
      <div className="pt-8 flex items-center justify-end gap-3 border-t max-w-5xl">
        <Button variant="ghost" onClick={() => router.push("/admin/products")} disabled={loading}>
          Discard Changes
        </Button>
        <Button loading={loading} onClick={handleSave} size="lg" className="px-8 shadow-xl shadow-primary/30">
          {isEdit ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </div>
  );
}
