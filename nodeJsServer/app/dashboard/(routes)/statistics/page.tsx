import type { Metadata } from "next";
import { Navbar } from '@/components/navbar';
import { Section } from '@/components/section';
import { SECTIONS } from "@/data/sections";

export const metadata: Metadata = {
    title: "Home - RESQ Dashboard",
    description: "RESQ dashboard homepage",
};

const HomePage = () => {
    return (
        <>
            <Navbar sections={SECTIONS} />
            <div className="w-full flex flex-col items-center py-[50px] pl-[490px] pr-[20px] gap-[50px]">
                {SECTIONS.map((section, index) => (
                    <Section key={index} id={`section-${index}`} sectionData={section} />
                ))}
            </div>
        </>
    );
};

export default HomePage;
