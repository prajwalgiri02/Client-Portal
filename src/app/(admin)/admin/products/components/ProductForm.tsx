"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Plus, GripVertical } from "lucide-react";
import { Button, Input, Textarea, Toggle, Card, CardHeader, CardTitle, CardContent, Select, useToast } from "@/components/admin-ui";
import { productsApi } from "@/lib/api/products";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  key: string;
  value: string;
  order: number;
}

interface OrderField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "radio" | "checkbox" | "file";
  required: boolean;
  helpText: string;
  placeholder: string;
  options: string[]; // Simple array of strings
  order: number;
}

interface ProductData {
  title: string;
  sku: string;
  price: number;
  stock: number;
  is_active: boolean;
  baseDescription: string;
  media: MediaFile[];
  specifications: SpecItem[]; // Renamed from specs
  order_fields: OrderField[]; // Renamed from orderFields
}

function SortableSpecItem({
  spec,
  onUpdate,
  onRemove,
}: {
  spec: SpecItem;
  onUpdate: (id: string, updates: Partial<SpecItem>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: spec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-end gap-3 rounded-xl border border-border/60 bg-background p-4 shadow-sm hover:bg-muted/10 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 flex-shrink-0 rounded-lg border border-border/60 bg-muted/20 p-1.5 hover:bg-muted/40 active:cursor-grabbing cursor-grab"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="min-w-0 flex-1 grid grid-cols-2 gap-4">
        <Input
          label="Specification Name"
          value={spec.key}
          onChange={(e) => onUpdate(spec.id, { key: e.target.value })}
          placeholder="e.g., Material"
          className="h-10 text-sm"
        />
        <Input
          label="Value"
          value={spec.value}
          onChange={(e) => onUpdate(spec.id, { value: e.target.value })}
          placeholder="e.g., 100% Cotton"
          className="h-10 text-sm"
        />
      </div>

      <Button variant="ghost" size="icon" onClick={() => onRemove(spec.id)} className="h-9 w-9 rounded-lg hover:bg-destructive/10">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

function SortableOrderField({ field, onUpdate, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleAddOption = () => {
    onUpdate(field.id, { options: [...field.options, ""] });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...field.options];
    newOptions[index] = value;
    onUpdate(field.id, { options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    onUpdate(field.id, { options: field.options.filter((_: any, i: number) => i !== index) });
  };

  const showOptions = ["select", "radio", "checkbox"].includes(field.type);

  return (
    <div ref={setNodeRef} style={style} className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
      <div className="flex items-start gap-3 bg-muted/10 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 flex-shrink-0 rounded-lg border border-border/60 bg-muted/20 p-1.5 hover:bg-muted/40 active:cursor-grabbing cursor-grab"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid grid-cols-12 gap-3 items-start">
            <div className="col-span-12 md:col-span-8">
              <Input
                label="Field Label"
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="e.g., Select Size"
                className="h-11 text-sm font-medium"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Select
                label="Input Type"
                value={field.type}
                onChange={(e) => onUpdate(field.id, { type: e.target.value as any })}
                options={[
                  { label: "Text", value: "text" },
                  { label: "Textarea", value: "textarea" },
                  { label: "Number", value: "number" },
                  { label: "Date", value: "date" },
                  { label: "Select Dropdown", value: "select" },
                  { label: "Radio Buttons", value: "radio" },
                  { label: "Checkboxes", value: "checkbox" },
                  { label: "File Upload", value: "file" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 border rounded-md p-3 bg-white/50">
              <Toggle label="Required Field" checked={field.required} onChange={(e) => onUpdate(field.id, { required: e.target.checked })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Help Text (Optional)"
              value={field.helpText}
              onChange={(e) => onUpdate(field.id, { helpText: e.target.value })}
              placeholder="Instructions for the user"
              className="h-10 text-xs"
            />
            <Input
              label="Placeholder (Optional)"
              value={field.placeholder}
              onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
              placeholder="Placeholder inside input"
              className="h-10 text-xs"
            />
          </div>

          {showOptions && (
            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Options</span>
                <Button size="sm" variant="outline" onClick={handleAddOption} className="h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1.5" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {field.options.map((option: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={option}
                      onChange={(e) => handleUpdateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="h-9 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(idx)}
                      className="h-9 w-9 rounded-lg hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={() => onRemove(field.id)} className="mt-1 h-9 w-9 rounded-lg hover:bg-destructive/10">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
  onLoading?: (loading: boolean) => void;
}

export const ProductForm = forwardRef<any, ProductFormProps>(({ initialData, isEdit, onLoading }, ref) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [product, setProduct] = useState<ProductData>({
    title: "",
    sku: "",
    price: 0,
    stock: 0,
    is_active: true,
    baseDescription: "",
    media: [],
    specifications: [],
    order_fields: [],
  });

  useEffect(() => {
    if (initialData) {
      setProduct({
        ...initialData,
        // Ensure arrays exist
        media: initialData.media || [],
        specifications: initialData.specifications || [],
        order_fields: initialData.order_fields?.map((f: any) => ({ ...f, options: f.options || [] })) || [],
      });
    } else if (!isEdit) {
      // Defaults for new product
      if (product.specifications.length === 0) addSpec();
      if (product.order_fields.length === 0) addOrderField();
    }
  }, [initialData, isEdit]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data: ProductData) => {
      // Prepare data for API
      const payload = {
        ...data,
        // Map simple local state to API expected format
        order_fields: data.order_fields.map((f, i) => ({
          ...f,
          is_required: f.required, // API expects is_required
          sort_order: i,
        })),
        specifications: data.specifications.map((s, i) => ({
          ...s,
          sort_order: i,
        })),
      };

      if (isEdit && initialData?.id) {
        return productsApi.updateProduct(initialData.id, payload);
      }
      return productsApi.createProduct(payload);
    },
    onSuccess: () => {
      success(`Product "${product.title}" ${isEdit ? "updated" : "published"} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/admin/products");
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to save product. Please try again.");
    },
  });

  useEffect(() => {
    onLoading?.(saveMutation.isPending);
  }, [saveMutation.isPending, onLoading]);

  useImperativeHandle(ref, () => ({
    submit: (active: boolean) => {
      if (!product.title.trim()) {
        toastError("Product title is required.");
        return;
      }
      saveMutation.mutate({ ...product, is_active: active });
    },
    isPending: saveMutation.isPending,
  }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateProduct = (key: keyof ProductData, value: any) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  const inferMediaType = (file: File): MediaFile["type"] => {
    const n = file.name.toLowerCase();
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf" || n.endsWith(".pdf")) return "pdf";
    if (n.includes("manual")) return "manual";
    if (n.includes("spec")) return "spec_sheet";
    return "image";
  };

  const addFilesToMedia = (files: FileList | File[]) => {
    const list = Array.from(files as any);
    const start = product.media.length;
    const newMedia = list.map(
      (f: File, idx: number): MediaFile => ({
        id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
        name: f.name,
        size: f.size,
        type: inferMediaType(f),
        order: start + idx,
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      }),
    );
    updateProduct("media", [...product.media, ...newMedia]);
  };

  const onPickMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      addFilesToMedia(e.target.files);
      e.target.value = "";
    }
  };

  const onDropMedia = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFilesToMedia(e.dataTransfer.files);
    }
  };

  const removeMedia = (id: string) => {
    const item = product.media.find((m) => m.id === id);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    updateProduct(
      "media",
      product.media.filter((m) => m.id !== id),
    );
  };

  const addSpec = () => {
    const newSpec: SpecItem = {
      id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
      key: "",
      value: "",
      order: product.specifications.length,
    };
    updateProduct("specifications", [...product.specifications, newSpec]);
  };

  const updateSpec = (id: string, updates: Partial<SpecItem>) => {
    const updated = product.specifications.map((s) => (s.id === id ? { ...s, ...updates } : s));
    updateProduct("specifications", updated);
  };

  const removeSpec = (id: string) => {
    updateProduct(
      "specifications",
      product.specifications.filter((s) => s.id !== id),
    );
  };

  const handleSpecDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = product.specifications.findIndex((s) => s.id === active.id);
      const newIndex = product.specifications.findIndex((s) => s.id === over.id);
      updateProduct("specifications", arrayMove(product.specifications, oldIndex, newIndex));
    }
  };

  const addOrderField = () => {
    const newField: OrderField = {
      id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
      label: "",
      type: "text",
      required: false,
      helpText: "",
      placeholder: "",
      options: [],
      order: product.order_fields.length,
    };
    updateProduct("order_fields", [...product.order_fields, newField]);
  };

  const updateOrderField = (id: string, updates: Partial<OrderField>) => {
    const updated = product.order_fields.map((f) => {
      if (f.id === id) {
        return { ...f, ...updates };
      }
      return f;
    });
    updateProduct("order_fields", updated);
  };

  const removeOrderField = (id: string) => {
    updateProduct(
      "order_fields",
      product.order_fields.filter((f) => f.id !== id),
    );
  };

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = product.order_fields.findIndex((f) => f.id === active.id);
      const newIndex = product.order_fields.findIndex((f) => f.id === over.id);
      updateProduct("order_fields", arrayMove(product.order_fields, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Product Title *"
                  value={product.title}
                  onChange={(e) => updateProduct("title", e.target.value)}
                  placeholder="Enter product title"
                />

                <Input
                  label="SKU"
                  value={product.sku}
                  onChange={(e) => updateProduct("sku", e.target.value)}
                  placeholder="Unique identifier"
                  helperText="Must be unique across all products"
                />

                <Input
                  label="Price"
                  type="number"
                  value={product.price}
                  onChange={(e) => updateProduct("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min={0}
                />

                <Input
                  label="Stock"
                  type="number"
                  value={product.stock}
                  onChange={(e) => updateProduct("stock", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min={0}
                />
              </div>

              <div className="mt-4">
                <Textarea
                  label="Base Description"
                  value={product.baseDescription}
                  onChange={(e) => updateProduct("baseDescription", e.target.value)}
                  placeholder="Product description..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onPickMedia} />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDropActive(true);
                  }}
                  onDragLeave={() => setIsDropActive(false)}
                  onDrop={onDropMedia}
                  className={`w-full cursor-pointer rounded-xl border-2 border-dashed p-8 transition ${
                    isDropActive ? "border-primary bg-muted/20" : "border-border/60 bg-muted/10 hover:bg-muted/20"
                  }`}
                >
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold">Drag and drop or click to upload</p>
                    <p className="mt-1 text-xs text-muted-foreground">Images, PDFs, and documents</p>
                  </div>

                  {product.media.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {product.media.map((m) => (
                        <div key={m.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
                          <div className="aspect-square bg-muted/10 flex items-center justify-center overflow-hidden">
                            {m.previewUrl ? (
                              <img src={m.previewUrl} alt={m.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="px-3 text-center text-xs text-muted-foreground">{m.name}</div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMedia(m.id);
                            }}
                            className="absolute right-2 top-2 rounded-lg border border-border/60 bg-background/90 p-1.5 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-destructive/10"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Specifications</CardTitle>
              <Button variant="outline" size="sm" onClick={addSpec}>
                <Plus className="mr-2 h-4 w-4" />
                Add Spec
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSpecDragEnd}>
                  <SortableContext items={product.specifications.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {product.specifications.map((spec) => (
                        <SortableSpecItem key={spec.id} spec={spec} onUpdate={updateSpec} onRemove={removeSpec} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 text-foreground">
              <div>
                <CardTitle>Order Form Fields</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Define fields clients must fill when ordering</p>
              </div>
              <Button variant="outline" size="sm" onClick={addOrderField}>
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                  <SortableContext items={product.order_fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {product.order_fields.map((field) => (
                        <SortableOrderField key={field.id} field={field} onUpdate={updateOrderField} onRemove={removeOrderField} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

ProductForm.displayName = "ProductForm";
