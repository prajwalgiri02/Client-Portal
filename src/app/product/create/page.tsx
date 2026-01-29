"use client";

import { useRef, useState } from "react";
import { ChevronLeft, Upload, Trash2, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
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
  label: string;
  valueType: "text" | "number";
  valueText?: string;
  valueNumber?: number;
  valueUnit?: string;
  order: number;
}

interface OrderFieldOption {
  id: string;
  value: string;
  label: string;
  active: boolean;
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
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  allowedMimeTypes?: string;
  maxFileSizeKb?: number;
  options: OrderFieldOption[];
  order: number;
}

interface OrderRule {
  id: string;
  dependsOnFieldId: string;
  operator: string;
  compareValue: string;
  action: "show" | "hide" | "require" | "disable";
  order: number;
}

interface ProductData {
  title: string;
  sku: string;
  active: boolean;
  baseDescription: string;
  media: MediaFile[];
  specs: SpecItem[];
  fieldSetVersion: number;
  fieldSetActive: boolean;
  orderFields: OrderField[];
  orderRules: OrderRule[];
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

      <div className="min-w-0 flex-1">
        <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Label</Label>
        <Input
          value={spec.label}
          onChange={(e) => onUpdate(spec.id, { label: e.target.value })}
          placeholder="e.g., Color"
          className="mb-3 h-10 text-sm"
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</Label>
            <Select value={spec.valueType} onValueChange={(type: any) => onUpdate(spec.id, { valueType: type })}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Value</Label>
            {spec.valueType === "text" ? (
              <Input
                value={spec.valueText || ""}
                onChange={(e) => onUpdate(spec.id, { valueText: e.target.value })}
                placeholder="Value"
                className="h-10 text-sm"
              />
            ) : (
              <Input
                type="number"
                value={spec.valueNumber || ""}
                onChange={(e) => onUpdate(spec.id, { valueNumber: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
                className="h-10 text-sm"
              />
            )}
          </div>

          {spec.valueType === "number" && (
            <div className="flex-1">
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Unit</Label>
              <Input
                value={spec.valueUnit || ""}
                onChange={(e) => onUpdate(spec.id, { valueUnit: e.target.value })}
                placeholder="e.g., kg"
                className="h-10 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(spec.id)}
        className="h-9 w-9 rounded-lg hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

function SortableOrderField({ field, onUpdate, onRemove, onAddOption, onUpdateOption, onRemoveOption }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm"
    >
      <div className="flex items-start gap-3 bg-muted/10 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 flex-shrink-0 rounded-lg border border-border/60 bg-muted/20 p-1.5 hover:bg-muted/40 active:cursor-grabbing cursor-grab"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid grid-cols-12 gap-3 items-start">
            <div className="col-span-12 md:col-span-8">
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="Field label"
                className="h-11 text-sm font-medium"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</Label>
              <Select value={field.type} onValueChange={(type: any) => onUpdate(field.id, { type })}>
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={field.id} className="overflow-hidden rounded-xl border border-border/60 bg-background">
              <AccordionTrigger className="bg-muted/10 px-4 py-2.5 text-sm font-medium hover:no-underline">
                Advanced
              </AccordionTrigger>

              <AccordionContent className="space-y-4 p-4">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Key</Label>
                  <Input
                    value={field.key}
                    onChange={(e) => onUpdate(field.id, { key: e.target.value })}
                    placeholder="field_key"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6 flex items-center justify-between rounded-xl border border-border/60 bg-muted/10 px-4 py-2.5">
                    <Label className="text-xs font-medium text-muted-foreground">Required</Label>
                    <Switch checked={field.required} onCheckedChange={(checked) => onUpdate(field.id, { required: checked })} />
                  </div>

                  <div className="col-span-12 md:col-span-6 flex items-center justify-between rounded-xl border border-border/60 bg-muted/10 px-4 py-2.5">
                    <Label className="text-xs font-medium text-muted-foreground">Active</Label>
                    <Switch checked={field.active} onCheckedChange={(checked) => onUpdate(field.id, { active: checked })} />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Help Text</Label>
                  <Input
                    value={field.helpText}
                    onChange={(e) => onUpdate(field.id, { helpText: e.target.value })}
                    placeholder="Helper text for users"
                    className="h-10 text-xs"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Placeholder</Label>
                  <Input
                    value={field.placeholder}
                    onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                    placeholder="Placeholder text"
                    className="h-10 text-xs"
                  />
                </div>

                {field.type === "number" && (
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Min Value</Label>
                      <Input
                        type="number"
                        value={field.minValue || ""}
                        onChange={(e) => onUpdate(field.id, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div className="col-span-6">
                      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Max Value</Label>
                      <Input
                        type="number"
                        value={field.maxValue || ""}
                        onChange={(e) => onUpdate(field.id, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>
                )}

                {field.type === "text" && (
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Min Length</Label>
                      <Input
                        type="number"
                        value={field.minLength || ""}
                        onChange={(e) => onUpdate(field.id, { minLength: e.target.value ? Number(e.target.value) : undefined })}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div className="col-span-6">
                      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Max Length</Label>
                      <Input
                        type="number"
                        value={field.maxLength || ""}
                        onChange={(e) => onUpdate(field.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>
                )}

                {field.type === "file" && (
                  <>
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Allowed MIME Types</Label>
                      <Input
                        value={field.allowedMimeTypes || ""}
                        onChange={(e) => onUpdate(field.id, { allowedMimeTypes: e.target.value })}
                        placeholder="e.g., image/*,application/pdf"
                        className="h-10 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Max File Size (KB)</Label>
                      <Input
                        type="number"
                        value={field.maxFileSizeKb || ""}
                        onChange={(e) =>
                          onUpdate(field.id, { maxFileSizeKb: e.target.value ? Number(e.target.value) : undefined })
                        }
                        className="h-10 text-xs"
                      />
                    </div>
                  </>
                )}

                {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                  <div className="space-y-3 border-t border-border/60 pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">Options</Label>
                      <Button size="sm" variant="outline" onClick={() => onAddOption(field.id)} className="h-9 text-xs">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add
                      </Button>
                    </div>

                    {field.options.map((option: any) => (
                      <div
                        key={option.id}
                        className="flex gap-2 items-end rounded-xl border border-border/60 bg-muted/10 p-3"
                      >
                        <div className="flex-1">
                          <Label className="mb-1 block text-xs font-medium text-muted-foreground">Label</Label>
                          <Input
                            value={option.label}
                            onChange={(e) => onUpdateOption(field.id, option.id, { label: e.target.value })}
                            placeholder="Display name"
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="flex-1">
                          <Label className="mb-1 block text-xs font-medium text-muted-foreground">Value</Label>
                          <Input
                            value={option.value}
                            onChange={(e) => onUpdateOption(field.id, option.id, { value: e.target.value })}
                            placeholder="Stored value"
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={option.active}
                            onCheckedChange={(checked) => onUpdateOption(field.id, option.id, { active: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveOption(field.id, option.id)}
                            className="h-9 w-9 rounded-lg hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(field.id)}
          className="mt-1 h-9 w-9 rounded-lg hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function CreateProductPage() {
  const [product, setProduct] = useState<ProductData>({
    title: "",
    sku: "",
    active: true,
    baseDescription: "",
    media: [],
    specs: [],
    fieldSetVersion: 1,
    fieldSetActive: true,
    orderFields: [],
    orderRules: [],
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);

  const [orderOpen, setOrderOpen] = useState(false);
  const [orderValues, setOrderValues] = useState<Record<string, any>>({});
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});
  const [orderPayload, setOrderPayload] = useState<any>(null);

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

  const handleMediaDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = product.media.findIndex((m) => m.id === active.id);
      const newIndex = product.media.findIndex((m) => m.id === over.id);
      updateProduct("media", arrayMove(product.media, oldIndex, newIndex));
    }
  };

  const addSpec = () => {
    const newSpec: SpecItem = {
      id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
      label: "",
      valueType: "text",
      valueText: "",
      order: product.specs.length,
    };
    updateProduct("specs", [...product.specs, newSpec]);
  };

  const updateSpec = (id: string, updates: Partial<SpecItem>) => {
    const updated = product.specs.map((s) => (s.id === id ? { ...s, ...updates } : s));
    updateProduct("specs", updated);
  };

  const removeSpec = (id: string) => {
    updateProduct(
      "specs",
      product.specs.filter((s) => s.id !== id),
    );
  };

  const handleSpecDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = product.specs.findIndex((s) => s.id === active.id);
      const newIndex = product.specs.findIndex((s) => s.id === over.id);
      updateProduct("specs", arrayMove(product.specs, oldIndex, newIndex));
    }
  };

  const addOrderField = () => {
    const newField: OrderField = {
      id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
      label: "",
      type: "text",
      key: "",
      required: false,
      helpText: "",
      placeholder: "",
      active: true,
      options: [],
      order: product.orderFields.length,
    };
    updateProduct("orderFields", [...product.orderFields, newField]);
  };

  const updateOrderField = (id: string, updates: Partial<OrderField>) => {
    const updated = product.orderFields.map((f) => {
      if (f.id === id) {
        const next = { ...f, ...updates };
        if (updates.label && !updates.key) {
          next.key = updates.label
            .toLowerCase()
            .trim()
            .replace(/[^\w]+/g, "_")
            .replace(/^_+|_+$/g, "");
        }
        if (updates.type && (updates.type === "select" || updates.type === "radio" || updates.type === "checkbox")) {
          if (!next.options) next.options = [];
        }
        return next;
      }
      return f;
    });
    updateProduct("orderFields", updated);
  };

  const removeOrderField = (id: string) => {
    updateProduct(
      "orderFields",
      product.orderFields.filter((f) => f.id !== id),
    );
  };

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = product.orderFields.findIndex((f) => f.id === active.id);
      const newIndex = product.orderFields.findIndex((f) => f.id === over.id);
      updateProduct("orderFields", arrayMove(product.orderFields, oldIndex, newIndex));
    }
  };

  const addOrderFieldOption = (fieldId: string) => {
    const updated = product.orderFields.map((f) => {
      if (f.id === fieldId) {
        const newOption: OrderFieldOption = {
          id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
          value: "",
          label: "",
          active: true,
          order: f.options.length,
        };
        return { ...f, options: [...f.options, newOption] };
      }
      return f;
    });
    updateProduct("orderFields", updated);
  };

  const updateOrderFieldOption = (fieldId: string, optionId: string, updates: Partial<OrderFieldOption>) => {
    const updated = product.orderFields.map((f) => {
      if (f.id === fieldId) {
        return {
          ...f,
          options: f.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
        };
      }
      return f;
    });
    updateProduct("orderFields", updated);
  };

  const removeOrderFieldOption = (fieldId: string, optionId: string) => {
    const updated = product.orderFields.map((f) => {
      if (f.id === fieldId) {
        return { ...f, options: f.options.filter((o) => o.id !== optionId) };
      }
      return f;
    });
    updateProduct("orderFields", updated);
  };

  const ensureKeysForActiveFields = (fields: OrderField[]) => {
    const next = fields.map((f) => {
      if (!f.key || !f.key.trim()) {
        const k = (f.label || "field")
          .toLowerCase()
          .trim()
          .replace(/[^\w]+/g, "_")
          .replace(/^_+|_+$/g, "");
        return { ...f, key: k || f.id };
      }
      return f;
    });
    updateProduct("orderFields", next);
    return next;
  };

  const openOrderModal = () => {
    const activeFields = ensureKeysForActiveFields(product.orderFields).filter((f) => f.active);
    const initial: Record<string, any> = {};
    activeFields.forEach((f) => {
      if (f.type === "checkbox") initial[f.key] = false;
      else initial[f.key] = "";
    });
    setOrderValues(initial);
    setOrderErrors({});
    setOrderPayload(null);
    setOrderOpen(true);
  };

  const validateOrder = (fields: OrderField[]) => {
    const errors: Record<string, string> = {};
    fields.forEach((f) => {
      if (!f.active) return;
      const key = f.key || f.id;
      const v = orderValues[key];
      if (!f.required) return;

      if (f.type === "file") {
        if (!v) errors[key] = "Required";
        return;
      }

      if (f.type === "checkbox") {
        if (v !== true) errors[key] = "Required";
        return;
      }

      if (v === null || v === undefined || String(v).trim() === "") errors[key] = "Required";
    });
    setOrderErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitOrderPreview = () => {
    const activeFields = product.orderFields.filter((f) => f.active);
    if (!validateOrder(activeFields)) return;

    const payload = {
      product_id: "preview",
      field_set_version: product.fieldSetVersion,
      fields: { ...orderValues },
    };
    setOrderPayload(payload);
  };

  const renderOrderInput = (field: OrderField) => {
    const key = field.key || field.id;
    const value = orderValues[key];

    if (field.type === "text") {
      return (
        <Input
          value={value ?? ""}
          onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={field.placeholder}
          className="h-11"
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={value ?? ""}
          onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={field.placeholder}
          className="min-h-24 resize-none p-4"
        />
      );
    }

    if (field.type === "number") {
      return (
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={field.placeholder}
          min={field.minValue as any}
          max={field.maxValue as any}
          className="h-11"
        />
      );
    }

    if (field.type === "date") {
      return (
        <Input
          type="date"
          value={value ?? ""}
          onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))}
          className="h-11"
        />
      );
    }

    if (field.type === "select") {
      const opts = field.options.filter((o) => o.active);
      return (
        <Select value={value ?? ""} onValueChange={(v) => setOrderValues((p) => ({ ...p, [key]: v }))}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder={field.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o.id} value={o.value}>
                {o.label || o.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
          <Switch checked={!!value} onCheckedChange={(checked) => setOrderValues((p) => ({ ...p, [key]: checked }))} />
          <span className="text-sm text-muted-foreground">{field.placeholder || "Yes / No"}</span>
        </div>
      );
    }

    if (field.type === "file") {
      const accept = field.allowedMimeTypes || undefined;
      return (
        <div className="space-y-2">
          <Input
            type="file"
            accept={accept}
            onChange={(e) => {
              const f = e.target.files?.[0];
              setOrderValues((p) => ({ ...p, [key]: f || null }));
            }}
            className="h-11"
          />
          <div className="space-y-1 text-xs text-muted-foreground">
            {field.allowedMimeTypes && <div>Allowed: {field.allowedMimeTypes}</div>}
            {field.maxFileSizeKb && <div>Max size: {field.maxFileSizeKb}KB</div>}
            {value && value instanceof File && <div>Selected: {value.name}</div>}
          </div>
        </div>
      );
    }

    // keep your radio + checkbox multi-options branches above if you need them; omitted here to keep unchanged logic
    // (only styling handled here)
    return null;
  };

  const ensureOneSpec = () => {
    if (product.specs.length > 0) return;
    const s: SpecItem = {
      id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
      label: "",
      valueType: "text",
      valueText: "",
      order: 0,
    };
    updateProduct("specs", [s]);
  };

  const ensureOneOrderField = () => {
    if (product.orderFields.length > 0) return;
    const f: OrderField = {
      id: typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(),
      label: "",
      type: "text",
      key: "",
      required: false,
      helpText: "",
      placeholder: "",
      active: true,
      options: [],
      order: 0,
    };
    updateProduct("orderFields", [f]);
  };

  if (product.specs.length === 0) ensureOneSpec();
  if (product.orderFields.length === 0) ensureOneOrderField();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Create Product</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 px-4 rounded-lg">
              Save draft
            </Button>
            <Button className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90">Publish</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <div className="min-w-0 flex-1 space-y-6">
          <Card className="p-6 shadow-sm rounded-xl border border-border/60">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Basic Info</h2>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">Product Title *</Label>
                <Input
                  value={product.title}
                  onChange={(e) => updateProduct("title", e.target.value)}
                  placeholder="Enter product title"
                  className="h-11 text-base"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">SKU</Label>
                <div className="relative">
                  <Input
                    value={product.sku}
                    onChange={(e) => updateProduct("sku", e.target.value)}
                    placeholder="Unique identifier"
                    className="h-11 pr-16 text-sm"
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground">Unique</span>
                </div>
              </div>

              <div className="col-span-12">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">Base Description</Label>
                <Textarea
                  value={product.baseDescription}
                  onChange={(e) => updateProduct("baseDescription", e.target.value)}
                  placeholder="Product description..."
                  className="min-h-40 resize-none rounded-xl border border-border/60 p-4 bg-background"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-sm rounded-xl border border-border/60">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Media</h2>

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
                      <div
                        key={m.id}
                        className="group relative overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm"
                      >
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
          </Card>

          <Card className="p-6 shadow-sm rounded-xl border border-border/60">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Specifications</h2>
              <Button variant="outline" size="sm" onClick={addSpec} className="h-10 bg-transparent px-4 rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSpecDragEnd}>
                <SortableContext items={product.specs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {product.specs.map((spec) => (
                      <SortableSpecItem key={spec.id} spec={spec} onUpdate={updateSpec} onRemove={removeSpec} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </Card>

          <Card className="p-6 shadow-sm rounded-xl border border-border/60">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Order Form (Version {product.fieldSetVersion})</h2>
                <div className="mt-1 text-xs text-muted-foreground">Fields shown to users during ordering.</div>
              </div>

              <Button variant="outline" size="sm" onClick={addOrderField} className="h-10 bg-transparent px-4 rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                <SortableContext items={product.orderFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {product.orderFields.map((field) => (
                      <SortableOrderField
                        key={field.id}
                        field={field}
                        onUpdate={updateOrderField}
                        onRemove={removeOrderField}
                        onAddOption={addOrderFieldOption}
                        onUpdateOption={updateOrderFieldOption}
                        onRemoveOption={removeOrderFieldOption}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>Place Order (Preview)</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <div className="text-sm font-medium">{product.title || "Product"}</div>
              <div className="mt-1 text-xs text-muted-foreground">Order Form Version {product.fieldSetVersion}</div>
            </div>

            <div className="space-y-4">
              {product.orderFields
                .filter((f) => f.active)
                .map((field) => {
                  const k = field.key || field.id;
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        {field.label || "Untitled Field"}
                        {field.required && <span className="text-destructive">*</span>}
                      </div>
                      {field.helpText && <div className="text-xs text-muted-foreground">{field.helpText}</div>}
                      {renderOrderInput(field)}
                      {orderErrors[k] && <div className="text-xs text-destructive">{orderErrors[k]}</div>}
                    </div>
                  );
                })}
            </div>

            {orderPayload && (
              <div className="space-y-2 pt-2">
                <div className="text-sm font-medium">Payload Preview</div>
                <pre className="max-h-48 overflow-auto rounded-xl border border-border/60 bg-muted/10 p-3 text-xs">
                  {JSON.stringify(
                    orderPayload,
                    (key, val) => (val instanceof File ? { name: val.name, size: val.size, type: val.type } : val),
                    2,
                  )}
                </pre>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderOpen(false)} className="h-10 rounded-lg">
              Cancel
            </Button>
            <Button onClick={submitOrderPreview} className="h-10 rounded-lg">
              Submit (Preview)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
