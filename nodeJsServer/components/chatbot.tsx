import RobotIcon from "@/components/icons/robot";
import WaveAsset from "@/components/assets/wave";
import SendIcon from "@/components/icons/send";

export default function Chatbot() {
    return (
        <div className="w-full h-full rounded-[15px] flex flex-col items-center bg-white shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)]">
            <div className="w-full h-[50px] rounded-t-[15px] overflow-hidden flex items-center gap-[8px] px-[20px] bg-gradient-to-tl from-secondary to-primary">
                <p className="text-background">Chat with the bot</p>
                <RobotIcon width={24} height={24} />
            </div>
            <WaveAsset className="w-full" />
            <div className="w-full flex-grow flex flex-col gap-[10px] px-[20px] pb-[20px]">

            </div>
            <div className="w-full h-[50px] flex items-center justify-center px-[20px] relative">
                <input type="text" placeholder="Enter your message..." className="appearance-none border-solid outline-none ring-0 bg-transparent placeholder:text-gray-dark w-full h-full border-t-[1px] border-gray-light text-text" />
                <div className="absolute right-[-20px] w-[40px] h-[40px] rounded-full flex items-center justify-center bg-gradient-to-tl from-secondary to-primary shadow-[0px_0px_10px_0px_rgba(0,_0,_0,_0.25)]">
                    <SendIcon width={20} height={20} className="fill-background" />
                </div>
            </div>
        </div>
    );
}
