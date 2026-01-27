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

function SortableMediaItem({
  file,
  onUpdate,
  onRemove,
}: {
  file: MediaFile;
  onUpdate: (id: string, updates: Partial<MediaFile>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border border-border">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded" title="Drag to reorder">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </button>
      <div className="h-10 w-10 bg-muted rounded flex-shrink-0 overflow-hidden border border-border">
        {file.previewUrl ? (
          <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
            {file.type === "pdf" ? "PDF" : file.type === "manual" ? "Man" : "File"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <Select value={file.type} onValueChange={(type: any) => onUpdate(file.id, { type })}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="image">Image</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="spec_sheet">Spec Sheet</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={() => onRemove(file.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-end gap-3 p-3 bg-muted/30 rounded-md border border-border">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded flex-shrink-0 mt-1"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <Label className="text-xs font-medium mb-1 block">Label</Label>
        <Input
          value={spec.label}
          onChange={(e) => onUpdate(spec.id, { label: e.target.value })}
          placeholder="e.g., Color"
          className="h-8 text-sm mb-2"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs font-medium mb-1 block">Type</Label>
            <Select value={spec.valueType} onValueChange={(type: any) => onUpdate(spec.id, { valueType: type })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs font-medium mb-1 block">Value</Label>
            {spec.valueType === "text" ? (
              <Input
                value={spec.valueText || ""}
                onChange={(e) => onUpdate(spec.id, { valueText: e.target.value })}
                placeholder="Value"
                className="h-8 text-sm"
              />
            ) : (
              <Input
                type="number"
                value={spec.valueNumber || ""}
                onChange={(e) => onUpdate(spec.id, { valueNumber: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
                className="h-8 text-sm"
              />
            )}
          </div>
          {spec.valueType === "number" && (
            <div className="flex-1">
              <Label className="text-xs font-medium mb-1 block">Unit</Label>
              <Input
                value={spec.valueUnit || ""}
                onChange={(e) => onUpdate(spec.id, { valueUnit: e.target.value })}
                placeholder="e.g., kg"
                className="h-8 text-sm"
              />
            </div>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(spec.id)}>
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-muted/30">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded flex-shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <Input
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            placeholder="Field label"
            className="h-8 text-sm mb-2 font-medium"
          />
          <div className="flex gap-2">
            <Select value={field.type} onValueChange={(type: any) => onUpdate(field.id, { type })}>
              <SelectTrigger className="h-8 text-sm w-40">
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

        <Accordion type="single" collapsible className="w-64">
          <AccordionItem value={field.id} className="border-0">
            <AccordionTrigger className="h-8 py-0 hover:no-underline">
              <span className="text-sm font-medium">Advanced</span>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-4 pb-3 space-y-3">
              <div>
                <Label className="text-xs font-medium mb-1 block">Key</Label>
                <Input
                  value={field.key}
                  onChange={(e) => onUpdate(field.id, { key: e.target.value })}
                  placeholder="field_key"
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Required</Label>
                <Switch checked={field.required} onCheckedChange={(checked) => onUpdate(field.id, { required: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Active</Label>
                <Switch checked={field.active} onCheckedChange={(checked) => onUpdate(field.id, { active: checked })} />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">Help Text</Label>
                <Input
                  value={field.helpText}
                  onChange={(e) => onUpdate(field.id, { helpText: e.target.value })}
                  placeholder="Helper text for users"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">Placeholder</Label>
                <Input
                  value={field.placeholder}
                  onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                  placeholder="Placeholder text"
                  className="h-8 text-xs"
                />
              </div>

              {field.type === "number" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs font-medium mb-1 block">Min Value</Label>
                    <Input
                      type="number"
                      value={field.minValue || ""}
                      onChange={(e) => onUpdate(field.id, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium mb-1 block">Max Value</Label>
                    <Input
                      type="number"
                      value={field.maxValue || ""}
                      onChange={(e) => onUpdate(field.id, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {field.type === "text" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs font-medium mb-1 block">Min Length</Label>
                    <Input
                      type="number"
                      value={field.minLength || ""}
                      onChange={(e) => onUpdate(field.id, { minLength: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium mb-1 block">Max Length</Label>
                    <Input
                      type="number"
                      value={field.maxLength || ""}
                      onChange={(e) => onUpdate(field.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {field.type === "file" && (
                <>
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Allowed MIME Types</Label>
                    <Input
                      value={field.allowedMimeTypes || ""}
                      onChange={(e) => onUpdate(field.id, { allowedMimeTypes: e.target.value })}
                      placeholder="e.g., image/*,application/pdf"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Max File Size (KB)</Label>
                    <Input
                      type="number"
                      value={field.maxFileSizeKb || ""}
                      onChange={(e) => onUpdate(field.id, { maxFileSizeKb: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8 text-xs"
                    />
                  </div>
                </>
              )}

              {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Options</Label>
                    <Button size="sm" variant="outline" onClick={() => onAddOption(field.id)} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {field.options.map((option: any) => (
                    <div key={option.id} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs font-medium mb-0.5 block">Label</Label>
                        <Input
                          value={option.label}
                          onChange={(e) => onUpdateOption(field.id, option.id, { label: e.target.value })}
                          placeholder="Display name"
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs font-medium mb-0.5 block">Value</Label>
                        <Input
                          value={option.value}
                          onChange={(e) => onUpdateOption(field.id, option.id, { value: e.target.value })}
                          placeholder="Stored value"
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch checked={option.active} onCheckedChange={(checked) => onUpdateOption(field.id, option.id, { active: checked })} />
                        <Button variant="ghost" size="icon" onClick={() => onRemoveOption(field.id, option.id)} className="h-7 w-7">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button variant="ghost" size="icon" onClick={() => onRemove(field.id)}>
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

  const addMedia = () => {
    fileInputRef.current?.click();
  };

  const updateMedia = (id: string, updates: Partial<MediaFile>) => {
    const updated = product.media.map((m) => (m.id === id ? { ...m, ...updates } : m));
    updateProduct("media", updated);
  };

  const removeMedia = (id: string) => {
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
      return <Input value={value ?? ""} onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))} placeholder={field.placeholder} />;
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={value ?? ""}
          onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={field.placeholder}
          className="min-h-24 resize-none"
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
        />
      );
    }

    if (field.type === "date") {
      return <Input type="date" value={value ?? ""} onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))} />;
    }

    if (field.type === "select") {
      const opts = field.options.filter((o) => o.active);
      return (
        <Select value={value ?? ""} onValueChange={(v) => setOrderValues((p) => ({ ...p, [key]: v }))}>
          <SelectTrigger>
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

    if (field.type === "radio") {
      const opts = field.options.filter((o) => o.active);
      return (
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={key}
                value={o.value}
                checked={value === o.value}
                onChange={(e) => setOrderValues((p) => ({ ...p, [key]: e.target.value }))}
              />
              <span>{o.label || o.value}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "checkbox") {
      const opts = field.options.filter((o) => o.active);
      if (opts.length > 0) {
        const arr: string[] = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {opts.map((o) => (
              <label key={o.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={arr.includes(o.value)}
                  onChange={(e) => {
                    const next = e.target.checked ? [...arr, o.value] : arr.filter((x) => x !== o.value);
                    setOrderValues((p) => ({ ...p, [key]: next }));
                  }}
                />
                <span>{o.label || o.value}</span>
              </label>
            ))}
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
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
          />
          <div className="text-xs text-muted-foreground space-y-1">
            {field.allowedMimeTypes && <div>Allowed: {field.allowedMimeTypes}</div>}
            {field.maxFileSizeKb && <div>Max size: {field.maxFileSizeKb}KB</div>}
            {value && value instanceof File && <div>Selected: {value.name}</div>}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Create Product</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Save draft</Button>
            <Button className="bg-primary hover:bg-primary/90">Publish</Button>
          </div>
        </div>
      </header>

      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        <div className="flex-1 space-y-6 min-w-0">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Product Title *</Label>
                <Input
                  value={product.title}
                  onChange={(e) => updateProduct("title", e.target.value)}
                  placeholder="Enter product title"
                  className="text-base"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">SKU</Label>
                <div className="relative">
                  <Input
                    value={product.sku}
                    onChange={(e) => updateProduct("sku", e.target.value)}
                    placeholder="Unique identifier"
                    className="text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Unique</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label className="text-sm font-medium">Active</Label>
                <Switch checked={product.active} onCheckedChange={(checked) => updateProduct("active", checked)} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Base Description</Label>
                <Textarea
                  value={product.baseDescription}
                  onChange={(e) => updateProduct("baseDescription", e.target.value)}
                  placeholder="Product description..."
                  className="resize-none min-h-32 p-4 border border-border rounded-md"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Media</h2>
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
                className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                  isDropActive ? "border-primary bg-muted/50" : "border-border hover:bg-muted/50"
                }`}
              >
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Images, PDFs, and documents</p>
              </div>

              {product.media.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMediaDragEnd}>
                  <SortableContext items={product.media.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {product.media.map((file) => (
                        <SortableMediaItem key={file.id} file={file} onUpdate={updateMedia} onRemove={removeMedia} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <Button variant="outline" size="sm" onClick={addMedia} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Media
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Specifications</h2>
            <div className="space-y-3">
              {product.specs.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSpecDragEnd}>
                  <SortableContext items={product.specs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {product.specs.map((spec) => (
                        <SortableSpecItem key={spec.id} spec={spec} onUpdate={updateSpec} onRemove={removeSpec} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              <Button variant="outline" size="sm" onClick={addSpec} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Spec
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order Form (Version {product.fieldSetVersion})</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch checked={product.fieldSetActive} onCheckedChange={(checked) => updateProduct("fieldSetActive", checked)} />
              </div>
            </div>

            <div className="space-y-3">
              {product.orderFields.length > 0 && (
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
              )}
              <Button variant="outline" size="sm" onClick={addOrderField} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </Card>
        </div>

        <div className="w-80 space-y-4 sticky top-24">
          <Card className="overflow-hidden">
            {/* Cover */}
            <div className="relative h-40 bg-muted">
              {product.media?.[0]?.previewUrl ? (
                <img src={product.media[0].previewUrl} alt={product.title || "Product"} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No cover image</div>
              )}

              {/* Top overlay */}
              <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
                <Badge variant={product.active ? "default" : "secondary"}>{product.active ? "Active" : "Inactive"}</Badge>

                <Button
                  size="sm"
                  className="shadow"
                  onClick={openOrderModal}
                  disabled={!product.fieldSetActive || product.orderFields.filter((f) => f.active).length === 0}
                >
                  Order
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold leading-snug line-clamp-2">{product.title || "Product Title"}</h3>

                {product.sku ? (
                  <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">SKU: —</p>
                )}
              </div>

              {product.baseDescription ? (
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{product.baseDescription}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description</p>
              )}

              {/* Specs as chips */}
              {product.specs?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">Specs</p>
                  <div className="flex flex-wrap gap-2">
                    {product.specs.map((spec) => {
                      const value =
                        spec.valueType === "text" ? spec.valueText || "" : `${spec.valueNumber ?? ""}${spec.valueUnit ? " " + spec.valueUnit : ""}`;

                      return (
                        <div
                          key={spec.id}
                          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                          title={`${spec.label || "—"}: ${value || "—"}`}
                        >
                          <span className="text-muted-foreground">{spec.label || "—"}:</span>
                          <span className="font-medium">{value || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Media row */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">{product.media?.length ? `${product.media.length} file(s)` : "No media"}</p>

                {product.media?.length > 0 && (
                  <div className="flex -space-x-2">
                    {product.media.slice(0, 3).map((file) => (
                      <div key={file.id} className="h-8 w-8 rounded-md border border-border bg-muted overflow-hidden" title={file.name}>
                        {file.previewUrl ? (
                          <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">{file.type}</div>
                        )}
                      </div>
                    ))}
                    {product.media.length > 3 && (
                      <div className="h-8 w-8 rounded-md border border-border bg-background flex items-center justify-center text-[10px] text-muted-foreground">
                        +{product.media.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Order Form Preview</h3>
            <div className="space-y-3 text-sm">
              {product.fieldSetActive ? (
                product.orderFields.filter((f) => f.active).length > 0 ? (
                  <div className="space-y-2">
                    {product.orderFields
                      .filter((f) => f.active)
                      .map((field) => (
                        <div key={field.id} className="space-y-1">
                          <div className="text-xs font-medium flex items-center gap-1">
                            {field.label || "Untitled Field"}
                            {field.required && <span className="text-destructive">*</span>}
                          </div>
                          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
                          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                            <div className="opacity-80 pointer-events-none">{renderOrderInput(field)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No fields added yet</p>
                )
              ) : (
                <p className="text-xs text-muted-foreground italic">Order form is inactive</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Place Order (Preview)</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm">
              <div className="font-medium">{product.title || "Product"}</div>
              <div className="text-xs text-muted-foreground">Order Form Version {product.fieldSetVersion}</div>
            </div>

            <div className="space-y-4">
              {product.orderFields
                .filter((f) => f.active)
                .map((field) => {
                  const k = field.key || field.id;
                  return (
                    <div key={field.id} className="space-y-1">
                      <div className="text-sm font-medium flex items-center gap-1">
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
                <pre className="text-xs bg-muted/30 border border-border rounded-md p-3 overflow-auto max-h-48">
                  {JSON.stringify(orderPayload, (key, val) => (val instanceof File ? { name: val.name, size: val.size, type: val.type } : val), 2)}
                </pre>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitOrderPreview}>Submit (Preview)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
