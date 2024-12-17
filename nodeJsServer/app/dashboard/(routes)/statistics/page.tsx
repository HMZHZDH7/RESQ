import type { Metadata } from "next";
import Navbar from '@/components/navbar';
import Section from '@/components/section';
import { getSvgContent } from '@/lib/get-svg-content';
const TEXT_FILTER: FilterType = 'text';
const NUMBER_FILTER: FilterType = 'number';

export const metadata: Metadata = {
    title: "Home - RESQ Dashboard",
    description: "RESQ dashboard homepage",
};

const HomePage = () => {

    const ImageSvg = getSvgContent("Image");

    const SECTIONS: ISectionData[] = [
        {
            label: 'Section 1',
            icon: ImageSvg,
            filters: [{
                name: "test",
                type: TEXT_FILTER,
                label: "Label test",
                placeholder: "Placeholder test"
            },
            {
                name: "test 2",
                type: NUMBER_FILTER,
                label: "Label test 2",
                placeholder: "Placeholder test 2"
            },
            {
                name: "test",
                type: TEXT_FILTER,
                label: "Label test",
                placeholder: "Placeholder test"
            },
            {
                name: "test 2",
                type: NUMBER_FILTER,
                label: "Label test 2",
                placeholder: "Placeholder test 2"
            }
            ]
        },
        {
            label: 'Section 2',
            icon: ImageSvg,
            filters: []
        },
        {
            label: 'Section 3',
            icon: ImageSvg,
            filters: []
        },
        {
            label: 'Section 4',
            icon: ImageSvg,
            filters: []
        },
        {
            label: 'Section 5',
            icon: ImageSvg,
            filters: []
        },
        {
            label: 'Section 6',
            icon: ImageSvg,
            filters: []
        },
        {
            label: 'Section 7',
            icon: ImageSvg,
            filters: []
        },
    ].map((section, index) => ({
        ...section,
        id: `section-${index}`
    }));

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
