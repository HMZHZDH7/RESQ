import { cn } from "@/lib/utils";
import Link from "next/link";

const CustomLink = ({
    href,
    className,
    children,
    prefetch
}: {
    href: string;
    className?: string;
    children?: React.ReactNode;
    prefetch?: boolean
}) => {
    return (
        <Link
            href={href}
            className={cn(
                "text-primary hover:text-accent transition",
                className
            )}
            prefetch={prefetch}
        >
            {children}
        </Link>
    );
};

export default CustomLink;
