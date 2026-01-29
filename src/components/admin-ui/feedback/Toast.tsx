"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300 bg-card",
              toast.type === "success" && "border-emerald-500/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
              toast.type === "error" && "border-destructive/50 bg-destructive/10 text-destructive",
              toast.type === "warning" && "border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
              toast.type === "info" && "border-blue-500/50 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
            )}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && <CheckCircle className="h-5 w-5" />}
              {toast.type === "error" && <AlertCircle className="h-5 w-5" />}
              {toast.type === "warning" && <AlertTriangle className="h-5 w-5" />}
              {toast.type === "info" && <Info className="h-5 w-5" />}
            </div>
            <div className="flex-1 space-y-1">
              {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 hover:opacity-70 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");

  return {
    toast: (message: string, options?: { title?: string; type?: ToastType }) => {
      context.addToast({ message, ...options });
    },
    success: (message: string, title?: string) => context.addToast({ message, title, type: "success" }),
    error: (message: string, title?: string) => context.addToast({ message, title, type: "error" }),
    info: (message: string, title?: string) => context.addToast({ message, title, type: "info" }),
    warning: (message: string, title?: string) => context.addToast({ message, title, type: "warning" }),
  };
}
