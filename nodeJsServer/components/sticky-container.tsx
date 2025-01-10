"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const StickyContainer = ({ height, className, classNameWhenSticky, children }: { height: number, className: string, classNameWhenSticky: string, children: React.ReactNode }) => {
    const stickyRef = useRef<HTMLDivElement | null>(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (stickyRef.current) {
                const { top } = stickyRef.current.getBoundingClientRect();
                setIsSticky(top <= height);
            };
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [height]);

    return (
        <div ref={stickyRef} style={{ top: `${height}px` }} className={cn(
            `sticky`,
            className,
            isSticky && classNameWhenSticky
        )}>
            {children}
        </div>
    );
};

export { StickyContainer };