"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Modal({ isOpen, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[95dvw]",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {/* Content */}
      <div
        className={cn("relative w-full bg-card border rounded-lg shadow-xl animate-in zoom-in-95 duration-200 flex flex-col", sizes[size])}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="space-y-1">
            {title && <h2 className="text-xl font-semibold leading-none tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <IconButton variant="ghost" size="sm" icon={<X className="h-4 w-4" />} onClick={onClose} />
        </div>

        <div className="p-6 overflow-y-auto max-h-[70dvh]">{children}</div>

        {footer && <div className="flex items-center justify-end gap-2 p-6 border-t bg-muted/50 rounded-b-lg">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export interface ConfirmModalProps extends Omit<ModalProps, "children" | "footer"> {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
}

import { Button } from "./Button";

export function ConfirmModal({
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading,
  ...props
}: ConfirmModalProps) {
  return (
    <Modal
      {...props}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={props.onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
    </Modal>
  );
}
