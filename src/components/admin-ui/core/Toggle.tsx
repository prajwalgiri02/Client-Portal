import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(({ className, label, id, ...props }, ref) => {
  const toggleId = id || React.useId();

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor={toggleId}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: props.checked ? "var(--primary)" : "var(--muted)" }}
      >
        <input type="checkbox" id={toggleId} className="sr-only" ref={ref} {...props} />
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            props.checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </label>
      {label && <span className="text-sm font-medium leading-none">{label}</span>}
    </div>
  );
});

Toggle.displayName = "Toggle";

export { Toggle };
