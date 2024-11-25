import { cn } from "@/lib/utils";

const ChatMessage = ({ children, type }: { children: React.ReactNode; type: "server" | "client" }) => {
    return <div className={cn("w-full flex", type === "server" ? "" : "flex-row-reverse")}>
        <div className={cn("rounded-[20px] flex px-[14px] py-[10px] max-w-[330px]", type === "server" ? "bg-[#00000008] text-text" : "bg-gradient-to-r from-primary to-accent text-background")}>{children}</div>
    </div>;
};

export default ChatMessage;