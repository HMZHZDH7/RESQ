import { cn } from "@/lib/utils";

const ChatMessage = ({ children, type }: { children: React.ReactNode; type: "server" | "client" | "error" }) => {
    return <div className={cn("w-full flex", type !== "client" ? "" : "flex-row-reverse")}>
        <div className={cn("rounded-[20px] flex px-[14px] py-[10px] max-w-[330px]", type === "server" ? "bg-[#00000008] text-text" : type === "error" ? "bg-[#f00] text-background" : "bg-gradient-to-r from-primary to-accent text-background")}>{children}</div>
    </div>;
};

export default ChatMessage;