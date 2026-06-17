import * as React from "react";
import { cn } from "@/lib/utils";

// Native range slider with a value label.
interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showValue?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, value, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {(label || showValue) && (
          <div className="flex justify-between text-sm">
            {label && <span className="font-medium">{label}</span>}
            {showValue && <span className="text-muted-foreground">{value}</span>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
