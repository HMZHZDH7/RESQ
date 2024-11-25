import { cn } from "@/lib/utils";
import Link from "next/link";

const CustomLink = ({
    href,
    className,
    children,
}: {
    href: string;
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <Link
            href={href}
            className={cn(
                "text-primary hover:text-accent transition",
                className
            )}
        >
            {children}
        </Link>
    );
};

export default CustomLink;
