import { cn } from "@/lib/utils";

const CmdCommand = ({ children, type }: { children: React.ReactNode; type: "server" | "client" | "error" }) => {
    return <div className={cn("flex items-center gap-[4px]",
        type === "client" && "text-[#77EE77]",
        type === "server" && "text-background ml-[10px] italic",
        type === "error" && "text-[#f00] ml-[10px]"
    )}>{type === "client" && <span>{"[Admin]$"}</span>}<div>{children}</div></div>;
};

export default CmdCommand;