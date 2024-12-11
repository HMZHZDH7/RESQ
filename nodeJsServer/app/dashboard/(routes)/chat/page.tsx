import ChartDisplay from "@/components/chart-display";
import ChartHistory from "@/components/chart-history";
import Chatbot from "@/components/chatbot";
import Cmd from "@/components/cmd";
import { WebSocketProvider } from '@/components/contexts/WebSocketContext';
import getSession from "@/lib/auth/getSession";

export default async function ChatPage() {
    const session = await getSession();
    return (
        <WebSocketProvider>
            <div className="w-full flex-grow flex justify-center gap-[30px] px-[20px] py-[50px] overflow-hidden">
                <div className="w-[440px] flex flex-col items-center gap-[10px]">
                    <Chatbot userIsAdmin={session?.role === "admin"} />
                </div>
                <div className="relative flex-grow rounded-[15px] flex flex-col items-center gap-[10px] px-[38px] py-[24px] bg-white shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)]">
                    <h1 className="text-3xl font-bold text-primary block w-full">Data visualization bot</h1>
                    <div className="w-full h-[1px] bg-gray-light"></div>
                    <ChartDisplay className="w-full flex-grow flex justify-center" />
                    <div className="w-full h-[1px] bg-gray-light"></div>
                    <h2 className="text-xl font-bold text-primary block w-full">Charts history</h2>
                    <ChartHistory />
                    {
                        session?.role === "admin" &&
                        <Cmd className="absolute left-0 -bottom-[50px] w-full" />
                    }
                </div>
            </div>
        </WebSocketProvider>
    );
}
