import SvgRenderer from "@/components/svg-renderer";
import Filter from "@/components/filter";

interface SectionProps {
    id: string;
    sectionData: SectionData;
}

const Section = ({ id, sectionData }: SectionProps) => {
    return (
        <div id={id} className="w-full rounded-[15px] flex flex-col items-center gap-[10px] px-[38px] py-[24px] bg-white shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)]">
            <div className="flex items-center justify-center gap-[6px]">
                <SvgRenderer svgContent={sectionData.icon} width={46} height={46} className="text-primary" /> <p className="text-2xl font-bold text-primary">{sectionData.label}</p>
            </div>
            {
                sectionData.filters.length > 0 &&
                <>
                    <div className="w-full px-[70px] py-[20px] flex flex-wrap gap-[50px]">
                        {sectionData.filters.map((filter) => (<Filter type="text" name="test" label="Input test" />))}
                    </div>
                    <div className="w-full h-[1px] bg-gray-light"></div>
                </>
            }
            <div>year quarter filter</div>
            <div className="w-full h-[1px] bg-gray-light"></div>
            <div>graphs</div>
        </div>
    );
};

export default Section;