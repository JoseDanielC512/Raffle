import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconButtonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-mountbatten_pink-500 text-mountbatten_pink-100 hover:bg-mountbatten_pink-500/80 hover:text-mountbatten_pink-100/90",
        accent: "bg-tekhelet-500 text-tekhelet-100 hover:bg-ultra_violet-500 hover:text-ultra_violet-100",
        destructive:
          "bg-sage-500 text-sage-100 hover:bg-sage-500/90",
        outline:
          "border border-battleship_gray-300 bg-battleship_gray-100 hover:bg-tekhelet-500 hover:text-tekhelet-100 dark:border-battleship_gray-700 dark:bg-battleship_gray-900",
        secondary:
          "bg-mountbatten_pink-500 text-mountbatten_pink-100 hover:bg-mountbatten_pink-500/80",
        ghost: "hover:bg-tekhelet-500 hover:text-tekhelet-100",
        link: "text-ultra_violet-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 w-10", // Standard size for icon buttons
        sm: "h-9 w-9",
        lg: "h-11 w-11",
        icon: "h-10 w-10", // Alias for default
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface IconButtonProps
  extends Omit<ButtonProps, "size" | "variant">,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  tooltip: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, tooltip, tooltipSide = "bottom", children, ...props }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(iconButtonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
            // If children are provided, they will be rendered inside the button,
            // otherwise, just the icon. This allows for flexibility.
          >
            <span className="flex items-center justify-center h-5 w-5">
              {icon}
            </span>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
