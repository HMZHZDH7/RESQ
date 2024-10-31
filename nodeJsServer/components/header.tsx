import Image from "next/image";
import Tab from "@/components/tab";
import DashboardIcon from "@/components/icons/dashboard";
import ChatbotIcon from "@/components/icons/chatbot";

const tabs = [
    {
        text: "Dashboard",
        link: "/dashboard/statistics",
        icon: <DashboardIcon className="fill-primary" width={28} height={28} />
    },
    {
        text: "Chatbot",
        link: "/dashboard/chat",
        icon: <ChatbotIcon className="fill-primary" width={28} height={28} />
    }
];

const Header = () => {
    return <div className="w-full h-[63px] flex bg-gray-light pt-[13px] pl-[60px] pr-[270px] sticky top-0 z-10">
        {
            tabs.map(t => (
                <Tab {...t} key={t.link} />
            ))
        }
        <Image src="/img/resq-logo.png" alt="resq + logo" width={220} height={63} className="absolute top-0 right-0"></Image>
    </div>;
};

export default Header;
