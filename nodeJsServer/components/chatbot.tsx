"use client";

import { useContext, useState, useEffect, useRef } from "react";
import RobotIcon from "@/components/icons/robot";
import WaveAsset from "@/components/assets/wave";
import SendIcon from "@/components/icons/send";
import ChatMessage from "@/components/chat-message";
import WebSocketContext from '@/components/contexts/WebSocketContext';
import Select from "@/components/user-select";

export default function Chatbot({ userIsAdmin }: { userIsAdmin?: boolean } = { userIsAdmin: false }) {
    const { messages, sendMessage, conversationIdsList, currentConversationId, setCurrentConversation } = useContext(WebSocketContext);
    const [input, setInput] = useState<string>('');
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    // Scroll to the bottom whenever messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (input.trim() !== "") {
            sendMessage(input);
            setInput('');
        };
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage(input);
            setInput('');
        };
    };

    return (
        <div className="w-full h-full rounded-[15px] flex flex-col items-center bg-white shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)]">
            <div className="w-full h-[50px] rounded-t-[15px] z-50 flex items-center justify-between px-[20px] bg-gradient-to-tl from-secondary to-primary">
                <div className="flex gap-[8px] items-center">
                    <p className="text-background font">Chat with the bot</p>
                    <RobotIcon width={24} height={24} />
                </div>
                {
                    userIsAdmin &&
                    <Select value={currentConversationId} placeholder="Select a conversation:" options={conversationIdsList.map(cId => ({ label: cId, value: cId }))} onChange={setCurrentConversation} className="w-[170px]" />
                }
            </div>
            <WaveAsset className="w-full" />
            <div className="w-full flex-grow relative overflow-hidden">
                <div ref={messagesContainerRef} className="absolute top-0 left-0 w-full h-full flex flex-col gap-[10px] px-[20px] pb-[20px] overflow-y-auto scroll-smooth">
                    {messages.map((message, index) => <ChatMessage key={index} type={message.type}>{message.content}</ChatMessage>)}
                </div>
            </div>
            <div className="w-full h-[50px] flex items-center justify-center px-[20px] relative">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter your message..." className="appearance-none border-solid outline-none ring-0 bg-transparent placeholder:text-gray-dark w-full h-full border-t-[1px] border-gray-light text-text" />
                <div onClick={handleSend} className="absolute right-[-20px] w-[40px] h-[40px] rounded-full flex items-center justify-center bg-gradient-to-tl from-secondary to-primary shadow-[0px_0px_10px_0px_rgba(0,_0,_0,_0.25)] cursor-pointer">
                    <SendIcon width={20} height={20} className="fill-background" />
                </div>
            </div>
        </div>
    );
}
