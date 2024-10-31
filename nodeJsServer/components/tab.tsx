"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Tab = ({ text, link, icon }: { text: string; link: string; icon: React.ReactNode }) => {
    const pathname = usePathname();

    const Container = link === pathname ? 'div' : Link;

    return <Container href={link} className="w-fit h-fit block cursor-pointer select-none">
        <div className="w-[180px] flex items-end">
            <svg className={cn(
                "size-[10px]",
                link === pathname ? "fill-background" : "hidden"
            )} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 10V0C10 5.52285 5.52285 10 0 10H10Z" fill="#F7FAFC" />
            </svg>
            <div className={cn(
                "flex-grow h-[50px] rounded-t-[10px] flex gap-[4px] items-center justify-center uppercase font-medium",
                link === pathname ? "text-primary bg-background [&>svg]:fill-primary" : "text-gray-dark [&>svg]:fill-gray-dark"
            )}>
                {icon}
                <div>{text}</div>
            </div>
            <svg className={cn(
                "size-[10px]",
                link === pathname ? "fill-background" : "hidden"
            )} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 10H10C4.47715 10 0 5.52285 0 0V10Z" fill="#F7FAFC" />
            </svg>
        </div>
    </Container>;
};

export default Tab;