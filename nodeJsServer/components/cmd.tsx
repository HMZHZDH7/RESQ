"use client";

import { useContext, useEffect, useRef, useState } from "react";
import WebSocketContext from '@/components/contexts/WebSocketContext';
import CmdCommand from "@/components/cmd-command";
import { cn } from "@/lib/utils";
import CmdIcon from "@/components/icons/cmd";

export default function Cmd({ className }: { className?: string }) {
    const { commands, sendCommand } = useContext(WebSocketContext);
    const [isShowed, setIsShowed] = useState<boolean>(false);

    const [input, setInput] = useState<string>('');
    const commandsContainerRef = useRef<HTMLDivElement | null>(null);

    // Scroll to the bottom whenever commands change
    useEffect(() => {
        if (commandsContainerRef.current) {
            commandsContainerRef.current.scrollTop = commandsContainerRef.current.scrollHeight;
        }
    }, [commands]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const command = input.trim();
            if (command) {
                sendCommand(input);
                setInput('');
            };
        };
    };

    return (
        <div className={cn(
            "relative h-[200px] flex flex-col bg-[#1e1e1e] text-[#d4d4d4] p-[20px] rounded-tr-[5px] font-[monospace] gap-[10px] whitespace-pre-wrap transition-transform duration-500 ease-in-out translate-y-[200px]",
            isShowed && "-translate-y-0",
            className)}>
            <div className="absolute w-[200px] h-[31px] top-[-30px] left-0 rounded-t-[5px] flex items-center gap-[4px] px-[10px] bg-[#1e1e1e] cursor-pointer" onClick={() => setIsShowed(prev => !prev)}>
                <CmdIcon width={24} height={24} />
                <div className="font-bold">Console</div>
            </div>
            <div ref={commandsContainerRef} className="w-full flex-grow flex flex-col-reverse overflow-y-auto scroll-smooth">
                {[...commands].reverse().map((command, index) => <CmdCommand key={index} type={command.type}>{command.content}</CmdCommand>)}
            </div>
            <div className="flex items-center gap-[4px]">
                <span>$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="appearance-none outline-none bg-transparent flex-grow h-full" />
            </div>
        </div>
    );
}
