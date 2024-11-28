import Tab from "@/components/tab";
import DashboardIcon from "@/components/icons/dashboard";
import ChatbotIcon from "@/components/icons/chatbot";
import LogoutIcon from "@/components/icons/logout";

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
    return <div className="flex w-full h-[63px] bg-gray-light px-[60px] sticky top-0 z-10 items-center justify-between">
        <div className="h-full flex  pt-[13px]">
            {
                tabs.map(t => (
                    <Tab {...t} key={t.link} />
                ))
            }

        </div>
        <img src="/img/resq-logo.png" alt="resq + logo" className="h-4/5 w-auto absolute left-1/2 transform -translate-x-1/2" />
        <a href="/logout" className="flex gap-[4px] items-center group">
            <LogoutIcon width={28} height={28} className="fill-red-600 group-hover:fill-red-700 transition" />
            <p className="text-red-600 group-hover:text-red-700 transition">Logout</p>
        </a>
    </div>
};

export default Header;
