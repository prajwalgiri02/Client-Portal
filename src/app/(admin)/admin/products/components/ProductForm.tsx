"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Trash2, Plus, GripVertical } from "lucide-react";
import { Button, Input, Textarea, Toggle, Card, CardHeader, CardTitle, CardContent, Select, useToast } from "@/components/admin-ui";
import { productsApi } from "@/lib/api/products";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Schemas & Types ---

const idSchema = z.union([z.string(), z.number()]).transform((val) => val.toString());

const mediaSchema = z.object({
  id: idSchema,
  name: z.string().optional().default(""),
  size: z.number().optional().default(0),
  type: z.enum(["image", "pdf", "manual", "spec_sheet"]).default("image"),
  order: z.number().optional().default(0),
  previewUrl: z.string().optional(),
  url: z.string().optional(),
  file: z.any().optional(),
});

const specSchema = z.object({
  id: idSchema,
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  order: z.number().optional().default(0),
});

const orderFieldSchema = z.object({
  id: idSchema,
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "textarea", "number", "date", "select", "radio", "checkbox", "file"]),
  required: z.boolean().default(false),
  helpText: z.string().nullish().default(""),
  placeholder: z.string().nullish().default(""),
  options: z.array(z.string()).nullish().default([]),
  order: z.number().optional().default(0),
});

const productSchema = z.object({
  title: z.string().min(1, "Product title is required"),

  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .default(0),
  stock: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val) : val))
    .default(0),
  is_active: z.boolean().default(true),
  base_description: z.string().nullish().default(""),
  media: z.array(mediaSchema).default([]),
  specifications: z.array(specSchema).default([]),
  order_fields: z.array(orderFieldSchema).default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

// --- Components ---

function SortableSpecItem({ index, onRemove }: { index: number; onRemove: (index: number) => void }) {
  const { register, watch } = useFormContext();
  const idValue = watch(`specifications.${index}.id`);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idValue });

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
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1 flex-shrink-0 rounded-lg border border-border/60 bg-muted/20 p-1.5 hover:bg-muted/40 active:cursor-grabbing cursor-grab"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="min-w-0 flex-1 grid grid-cols-2 gap-4">
        <Input label="Specification Name" {...register(`specifications.${index}.key`)} placeholder="e.g., Material" className="h-10 text-sm" />
        <Input label="Value" {...register(`specifications.${index}.value`)} placeholder="e.g., 100% Cotton" className="h-10 text-sm" />
      </div>

      <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="h-9 w-9 rounded-lg hover:bg-destructive/10">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

function SortableOrderField({ index, onRemove }: any) {
  const { register, watch, control, setValue } = useFormContext();
  const field = watch(`order_fields.${index}`);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const options = field.options || [];

  const handleAddOption = () => {
    setValue(`order_fields.${index}.options`, [...options, ""]);
  };

  const handleRemoveOption = (optIndex: number) => {
    setValue(
      `order_fields.${index}.options`,
      options.filter((_: any, i: number) => i !== optIndex),
    );
  };

  const showOptions = ["select", "radio", "checkbox"].includes(field.type);

  return (
    <div ref={setNodeRef} style={style} className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
      <div className="flex items-start gap-3 bg-muted/10 p-4">
        <button
          type="button"
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
                {...register(`order_fields.${index}.label`)}
                placeholder="e.g., Select Size"
                className="h-11 text-sm font-medium"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Select
                label="Input Type"
                value={field.type}
                onChange={(e) => setValue(`order_fields.${index}.type`, e.target.value)}
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
              <Toggle
                label="Required Field"
                checked={field.required}
                onChange={(e) => setValue(`order_fields.${index}.required`, e.target.checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Help Text (Optional)"
              {...register(`order_fields.${index}.helpText`)}
              placeholder="Instructions for the user"
              className="h-10 text-xs"
            />
            <Input
              label="Placeholder (Optional)"
              {...register(`order_fields.${index}.placeholder`)}
              placeholder="Placeholder inside input"
              className="h-10 text-xs"
            />
          </div>

          {showOptions && (
            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Options</span>
                <Button type="button" size="sm" variant="outline" onClick={handleAddOption} className="h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1.5" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {options.map((option: string, optIdx: number) => (
                  <div key={optIdx} className="flex gap-2 items-center">
                    <Input {...register(`order_fields.${index}.options.${optIdx}`)} placeholder={`Option ${optIdx + 1}`} className="h-9 text-xs" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(optIdx)}
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

        <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)} className="mt-1 h-9 w-9 rounded-lg hover:bg-destructive/10">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// Helper hook for form context
import { useFormContext } from "react-hook-form";

// --- Main Form Component ---

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
  onLoading?: (loading: boolean) => void;
}

export const ProductForm = forwardRef<any, ProductFormProps>(({ initialData, isEdit, onLoading }, ref) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",

      price: 0,
      stock: 0,
      is_active: true,
      base_description: "",
      media: [],
      specifications: [],
      order_fields: [],
    },
  });

  const { control, handleSubmit, reset, setValue, watch } = methods;

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
    move: moveSpec,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const {
    fields: orderFields,
    append: appendOrderField,
    remove: removeOrderField,
    move: moveOrderField,
  } = useFieldArray({
    control,
    name: "order_fields",
  });

  const {
    fields: mediaFields,
    append: appendMedia,
    remove: removeMedia,
  } = useFieldArray({
    control,
    name: "media",
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        base_description: initialData.base_description || initialData.baseDescription || "",
        price: parseFloat(initialData.price) || 0,
        stock: parseInt(initialData.stock) || 0,
        media:
          initialData.media?.map((m: any) => ({
            ...m,
            id: String(m.id || crypto.randomUUID()),
            name: m.name || `Image-${m.id}`,
            previewUrl: m.url || m.previewUrl || "",
          })) || [],
        specifications:
          initialData.specifications?.map((s: any) => ({
            ...s,
            id: String(s.id || crypto.randomUUID()),
          })) || [],
        order_fields:
          initialData.order_fields?.map((f: any) => ({
            ...f,
            id: String(f.id || crypto.randomUUID()),
            label: f.label || "",
            type: f.type || "text",
            required: !!(f.is_required || f.required),
            helpText: f.help_text || f.helpText || "",
            placeholder: f.placeholder || "",
            options: f.options || [],
          })) || [],
      });
    } else if (!isEdit) {
      if (specFields.length === 0) appendSpec({ id: crypto.randomUUID(), key: "", value: "", order: 0 });
      if (orderFields.length === 0)
        appendOrderField({ id: crypto.randomUUID(), label: "", type: "text", required: false, helpText: "", placeholder: "", options: [], order: 0 });
    }
  }, [initialData, isEdit, reset]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data: ProductFormValues) => {
      const formData = new FormData();

      // Append basic fields
      formData.append("title", data.title);

      formData.append("price", data.price.toString());
      formData.append("stock", data.stock.toString());
      formData.append("is_active", data.is_active ? "1" : "0");
      formData.append("base_description", data.base_description || "");

      // Append specifications as JSON
      const specifications = data.specifications.map((s, index) => ({
        ...(typeof s.id === "number" ? { id: s.id } : {}),
        key: s.key,
        value: s.value,
        sort_order: index,
      }));
      formData.append("specifications", JSON.stringify(specifications));

      // Append order fields as JSON
      const order_fields = data.order_fields.map((f, index) => ({
        ...(typeof f.id === "number" ? { id: f.id } : {}),
        label: f.label,
        type: f.type,
        is_required: f.required,
        help_text: f.helpText,
        placeholder: f.placeholder,
        options: f.options,
        sort_order: index,
      }));
      formData.append("order_fields", JSON.stringify(order_fields));

      // Append Media (Unified array)
      data.media.forEach((m, index) => {
        if (m.file) {
          // New file to upload
          formData.append(`media[${index}][file]`, m.file);
          formData.append(`media[${index}][type]`, m.type);
          formData.append(`media[${index}][sort_order]`, index.toString());
        } else {
          // Existing file ID (Use file_id if available from backend, else fall back to id)
          formData.append(`media[${index}][id]`, (m as any).file_id || m.id);
          formData.append(`media[${index}][type]`, m.type);
          formData.append(`media[${index}][sort_order]`, index.toString());
        }
      });

      if (isEdit && initialData?.id) {
        formData.append("_method", "PUT");
        return productsApi.updateProduct(initialData.id, formData);
      }
      return productsApi.createProduct(formData);
    },
    onSuccess: () => {
      success(`Product updated successfully.`);
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
      setValue("is_active", active);
      handleSubmit(
        (data) => {
          console.log("Submitting form data:", data);
          saveMutation.mutate(data);
        },
        (errors) => {
          console.error("Form validation errors:", errors);
        },
      )();
    },
    isPending: saveMutation.isPending,
  }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const inferMediaType = (file: File): any => {
    const n = file.name.toLowerCase();
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf" || n.endsWith(".pdf")) return "pdf";
    if (n.includes("manual")) return "manual";
    if (n.includes("spec")) return "spec_sheet";
    return "image";
  };

  const addFilesToMedia = (files: FileList | File[]) => {
    const list = Array.from(files as any);
    const currentLength = mediaFields.length;
    list.forEach((f: any, idx: number) => {
      appendMedia({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: inferMediaType(f),
        order: currentLength + idx,
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        file: f,
      });
    });
  };

  const handleSpecDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = specFields.findIndex((s) => s.id === active.id);
      const newIndex = specFields.findIndex((s) => s.id === over.id);
      moveSpec(oldIndex, newIndex);
    }
  };

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderFields.findIndex((f) => f.id === active.id);
      const newIndex = orderFields.findIndex((f) => f.id === over.id);
      moveOrderField(oldIndex, newIndex);
    }
  };

  return (
    <FormProvider {...methods}>
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
                    {...methods.register("title")}
                    error={methods.formState.errors.title?.message}
                    placeholder="Enter product title"
                  />

                  <Input label="Price" type="number" {...methods.register("price", { valueAsNumber: true })} placeholder="0.00" min={0} />

                  <Input label="Stock" type="number" {...methods.register("stock", { valueAsNumber: true })} placeholder="0" min={0} />
                </div>

                <div className="mt-4">
                  <Controller
                    name="base_description"
                    control={methods.control}
                    render={({ field }) => (
                      <Textarea label="Description" value={field.value} onChange={field.onChange} placeholder="Product description..." rows={8} />
                    )}
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        addFilesToMedia(e.target.files);
                        e.target.value = "";
                      }
                    }}
                  />

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
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDropActive(false);
                      if (e.dataTransfer.files?.length) addFilesToMedia(e.dataTransfer.files);
                    }}
                    className={`w-full cursor-pointer rounded-xl border-2 border-dashed p-8 transition ${
                      isDropActive ? "border-primary bg-muted/20" : "border-border/60 bg-muted/10 hover:bg-muted/20"
                    }`}
                  >
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold">Drag and drop or click to upload</p>
                      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP images, PDFs, Manuals</p>
                    </div>

                    {mediaFields.length > 0 && (
                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {mediaFields.map((m, index) => (
                          <div key={m.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
                            <div className="aspect-square bg-muted/10 flex items-center justify-center overflow-hidden">
                              {(m as any).previewUrl || (m as any).url ? (
                                <img src={(m as any).previewUrl || (m as any).url} alt={m.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="px-3 text-center text-xs text-muted-foreground">{m.name}</div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMedia(index);
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSpec({ id: crypto.randomUUID(), key: "", value: "", order: specFields.length })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Spec
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSpecDragEnd}>
                    <SortableContext items={specFields.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {specFields.map((field, index) => (
                          <SortableSpecItem key={field.id} index={index} onRemove={removeSpec} />
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendOrderField({
                      id: crypto.randomUUID(),
                      label: "",
                      type: "text",
                      required: false,
                      helpText: "",
                      placeholder: "",
                      options: [],
                      order: orderFields.length,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                    <SortableContext items={orderFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {orderFields.map((field, index) => (
                          <SortableOrderField key={field.id} index={index} onRemove={removeOrderField} />
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
    </FormProvider>
  );
});

ProductForm.displayName = "ProductForm";
