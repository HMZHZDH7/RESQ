import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const ToggleInput = React.forwardRef<HTMLInputElement, ToggleInputProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <label
                className={cn(
                    className,
                    "flex items-center cursor-pointer gap-[15px]"
                )}
            >
                <input
                    type="checkbox"
                    className="peer hidden"
                    ref={ref}
                    {...props}
                />
                <div className="w-[34px] h-[20px] bg-gray-dark rounded-full relative transition peer-checked:bg-primary peer-checked:*:translate-x-[14px]">
                    <div className="absolute block top-[2px] left-[2px] w-[16px] h-[16px] bg-background rounded-full transition-all"></div>
                </div>
                <span className="text-text">{label}</span>
            </label>
        );
    }
);
ToggleInput.displayName = "ToggleInput";

export { ToggleInput };
