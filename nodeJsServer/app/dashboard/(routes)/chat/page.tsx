import ChartDisplay from "@/components/chart-display";
import ChartHistory from "@/components/chart-history";
import Chatbot from "@/components/chatbot";
import { WebSocketProvider } from '@/components/contexts/WebSocketContext';
import getSession from "@/lib/auth/getSession";

export default async function ChatPage() {
    const session = await getSession();
    console.log(session);
    return (
        <WebSocketProvider>
            <div className="w-full flex-grow flex justify-center gap-[30px] px-[20px] py-[50px]">
                <div className="w-[440px] flex flex-col items-center gap-[10px]">
                    <Chatbot />
                </div>
                <div className="flex-grow rounded-[15px] flex flex-col items-center gap-[10px] px-[38px] py-[24px] bg-white shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)]">
                    <h1 className="text-3xl font-bold text-primary block w-full">Data visualization bot</h1>
                    <div className="w-full h-[1px] bg-gray-light"></div>
                    <ChartDisplay className="w-full flex-grow flex justify-center" />
                    <div className="w-full h-[1px] bg-gray-light"></div>
                    <h2 className="text-xl font-bold text-primary block w-full">Charts history</h2>
                    <ChartHistory />
                </div>
            </div>
        </WebSocketProvider>
    );
}
