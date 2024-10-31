import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

const filterVariants = cva(
    "min-w-[150px] h-[48px] rounded-[4px] bg-background border-[1px] border-solid border-gray-light text-text transition-all outline-none px-[24px] placeholder:text-gray-dark",
    {
        variants: {
            type: {
                text:
                    "",
                number:
                    ""
            }
        },
        defaultVariants: {
            type: "text",
        },
    }
);
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

interface FilterProps extends WithRequired<VariantProps<typeof filterVariants>, "type"> {
    name: string;
    label: string;
    type: "text" | "number";
    className?: string;
};

const Filter = (
    ({ className, type, name, label }: FilterProps) => {
        let placeholder =
            type === "text" ? "Enter some text..." :
                type === "number" ? "Enter a number" : "";

        return (
            <div className={cn("flex items-center gap-[10px]", className)}>
                <label className="whitespace-nowrap text-text">{label}</label>
                <input
                    type={type}
                    name={name}
                    className={cn(filterVariants({ type }), className)}
                    placeholder={placeholder}
                />
            </div>
        );
    }
);

export default Filter;