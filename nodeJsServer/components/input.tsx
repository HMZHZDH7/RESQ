import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, placeholder, ...props }, ref) => {
    return (
        <div className={cn(className, "relative mt-[5px]")}>
            <input
                className=" w-full h-[48px] rounded-[4px] border border-gray-light text-text transition-all hover:border-accent focus:border-primary outline-none px-[20px] peer"
                ref={ref}
                placeholder=" "
                {...props}
            />
            <span className="absolute -top-[20px] text-sm left-0 text-accent  pointer-events-none peer-focus:-top-[20px] peer-focus:left-0 peer-focus:text-sm peer-focus:text-accent peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-dark peer-placeholder-shown:top-[12px] peer-placeholder-shown:left-[20px] transition-all">
                {placeholder}
            </span>
        </div>
    );
});
Input.displayName = "Input";

export { Input };
