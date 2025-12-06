"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "relative h-4 w-4 rounded border-2 transition-all flex items-center justify-center",
              checked
                ? "bg-primary border-primary"
                : "bg-background border-border",
              className
            )}
          >
            {checked && (
              <Check className="h-3 w-3 text-primary-foreground" />
            )}
          </div>
        </div>
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

