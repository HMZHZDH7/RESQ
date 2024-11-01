"use client"

import { useEffect, useRef, useState } from "react";
import GearIcon from "@/components/icons/gear";
import { cn } from "@/lib/utils"; // Utility for conditional classNames
import SvgRenderer from "@/components/svg-renderer"; // Renders SVG icons

// Define interface for Navbar component props
interface NavbarProps {
    sections: SectionData[];
}

// Navbar component with navigation links for quick section access
const Navbar = ({ sections }: NavbarProps) => {

    const [activeSection, setActiveSection] = useState<string>(''); // Tracks the active section based on scroll
    const isUserScrollingRef = useRef<boolean>(true); // Ref to control scroll behavior

    // Effect to track scroll position and determine the active section
    useEffect(() => {
        const handleScroll = () => {
            if (!isUserScrollingRef.current) return;

            const windowMiddle = window.innerHeight / 3;
            const activeSections: string[] = []; // List to track sections currently in view

            sections.forEach(({ id }) => {
                const section = document.getElementById(id);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < windowMiddle) {
                        activeSections.push(id); // Add section to active list if in view
                    }
                }
            });

            // Update active section if any are currently in view
            if (activeSections.length > 0) {
                const lastActiveSection = activeSections[activeSections.length - 1];
                setActiveSection(lastActiveSection);
                document.getElementById(`nav-${lastActiveSection}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };

        const handleUserScroll = () => {
            isUserScrollingRef.current = true; //Enable user scroll detection
        };

        // Add listeners to detect scrolling and update active section
        window.addEventListener('wheel', handleUserScroll);
        window.addEventListener('touchmove', handleUserScroll);
        window.addEventListener('scroll', handleScroll);

        handleScroll(); // Initial check for active section on mount

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('wheel', handleUserScroll);
            window.removeEventListener('touchmove', handleUserScroll);
        };
    }, [sections]);

    // Function to scroll to a specific section when clicked in the navbar
    const handleClick = (id: string) => {
        const section = document.getElementById(id);
        const headerHeight = 113;
        if (section) {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = sectionTop - headerHeight;

            isUserScrollingRef.current = false; // Disable user scroll detection temporarily

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
            setActiveSection(id); // Set clicked section as active
        }
    };

    return (
        <div className="fixed left-[20px] top-0 w-[440px] h-screen flex flex-col items-center justify-center pt-[110px] pb-[50px]">
            <div className="w-full h-full rounded-[15px] flex flex-col items-center gap-[30px] px-[38px] py-[24px] bg-primary shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)]">

                <div className="w-full rounded-[15px] flex flex-col items-center gap-[5px] py-[10px] bg-[#09101b66]">
                    <p className="text-xl text-background font-bold">Number of patients:</p>
                    <p className="text-4xl text-background font-bold">2400</p>
                </div>

                <div className="w-full rounded-[15px] flex flex-col items-center gap-[5px] py-[10px] bg-[#09101b66]">
                    <div className="flex items-center justify-center gap-[6px]">
                        <GearIcon width={26} height={26} className="fill-white" />
                        <p className="text-xl text-background font-bold">Settings</p>
                    </div>
                    <div className="flex items-center justify-center gap-[10px]">
                        <p className="text-background font-bold">Show only graphs with warning</p>
                        <p>switch</p>
                    </div>
                </div>

                <p className="text-xl font-bold text-background">Quick access to a section</p>

                <nav className="scrollable-container no-scrollbar relative w-full flex-grow flex flex-col items-center overflow-auto">
                    <div className="up-arrow sticky top-0 w-full flex justify-center h-[20px] bg-gradient-to-b from-primary to-transparent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-[20px] text-background">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    </div>

                    <ul className="w-full flex-grow flex flex-col items-center gap-[10px]">
                        {sections.map((section, index) => (
                            <li id={`nav-section-${index}`} className={cn("w-full flex items-center gap-[12px] p-[12px] cursor-pointer select-none rounded-[15px] hover:bg-[#fbfdfe33]", activeSection === `section-${index}` && "bg-[#fbfdfe33]")}
                                key={index} onClick={() => handleClick(`section-${index}`)}>
                                <SvgRenderer svgContent={section.icon} width={30} height={30} className="text-background" />
                                <p className="text-background font-bold">{section.label}</p>
                            </li>
                        ))}
                    </ul>

                    <div className="down-arrow sticky bottom-0 w-full flex justify-center h-[20px] bg-gradient-to-t from-primary to-transparent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-[20px] text-background">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
