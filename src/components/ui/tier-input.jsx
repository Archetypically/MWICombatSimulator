import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

const TierInput = React.forwardRef(
    ({ className, value, onChange, min = 1, max = 10, disabled = false, ...props }, ref) => {
        const handleDecrement = () => {
            if (!disabled && value > min) {
                onChange?.(value - 1);
            }
        };

        const handleIncrement = () => {
            if (!disabled && value < max) {
                onChange?.(value + 1);
            }
        };

        const handleInputChange = (e) => {
            const newValue = parseInt(e.target.value, 10);
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
                onChange?.(newValue);
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1",
                    disabled && "opacity-50 cursor-not-allowed",
                    className,
                )}
                {...props}
            >
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={disabled || value <= min}
                    className="flex h-6 w-6 items-center justify-center rounded-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease tier"
                >
                    <Minus className="h-3 w-3" />
                </button>

                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    disabled={disabled}
                    min={min}
                    max={max}
                    className="w-10 bg-transparent text-center text-sm font-medium outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={disabled || value >= max}
                    className="flex h-6 w-6 items-center justify-center rounded-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase tier"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>
        );
    },
);

TierInput.displayName = "TierInput";

export { TierInput };
