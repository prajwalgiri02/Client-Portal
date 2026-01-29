import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(({ className, label, id, ...props }, ref) => {
  const radioId = id || React.useId();

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex items-center">
        <input
          type="radio"
          id={radioId}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-background checked:border-[5px]",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
      {label && (
        <label htmlFor={radioId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = "Radio";

export { Radio };
