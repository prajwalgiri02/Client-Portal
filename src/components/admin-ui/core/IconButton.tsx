import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./Button";

export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  icon: React.ReactNode;
  tooltip?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({ icon, className, size = "icon", tooltip, ...props }, ref) => {
  return (
    <div className="relative group inline-block">
      <Button ref={ref} size={size} className={cn("p-0", className)} {...props}>
        {icon}
      </Button>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-secondary text-secondary-foreground text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {tooltip}
        </div>
      )}
    </div>
  );
});

IconButton.displayName = "IconButton";

export { IconButton };
