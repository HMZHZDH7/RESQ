import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "flex rounded-[4px] justify-center items-center transition bg-primary text-background hover:bg-accent active:bg-background active:text-text active:border-primary active:border",
    {
        variants: {
            size: {
                small: "h-[35px] min-w-[150px]",
                big: "h-[40px] min-w-[170px]",
            },
        },
        defaultVariants: {
            size: "big",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ className, size }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
