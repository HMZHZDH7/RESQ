"use client";

import { SvgRenderer } from "@/components/svg-renderer";
import { ChartClient } from "@/components/chart-client";
import { YearQuarterInput } from "@/components/inputs/year-quarter-input";
import { Select } from "@/components/inputs/select";
import { tempCoutriesWithSites } from "@/data/temp-coutries-sites";
import { useContext, useState } from "react";
import { AlertContext } from "@/components/contexts/AlertContext";
import { Button } from "@/components/button";
import { deepEqual } from "@/lib/utils";

interface SectionProps {
    id: string;
    sectionData: SectionModule.Data;
};

const Section = ({ id, sectionData }: SectionProps) => {
    const { addNewAlert } = useContext(AlertContext);

    const coutryOptionsList: SelectInput.Option[] = Object.keys(tempCoutriesWithSites).map(tCWS => ({ value: tCWS, label: tCWS }));
    const siteOptionsList: Record<string, SelectInput.Option[]> = (Object.keys(tempCoutriesWithSites) as (keyof typeof tempCoutriesWithSites)[]).reduce((acc, current) => {
        acc[current] = tempCoutriesWithSites[current].map(tCWS => ({ value: tCWS, label: tCWS }));
        return acc;
    }, {} as Record<string, SelectInput.Option[]>);

    const [firstYearQuarter, setFirstYearQuarter] = useState<YearQuarterInput.YearQuarter | null>(null);
    const [secondYearQuarter, setSecondYearQuarter] = useState<YearQuarterInput.YearQuarter | null>(null);

    const [country, setCountry] = useState<string>("");
    const [site, setSite] = useState<string>("");
    const [siteOptions, setSiteOptions] = useState<SelectInput.Option[]>([]);

    const [currentlyAppliedFilterValues, setCurrentlyAppliedFilterValues] = useState<SectionModule.Filters>({});

    const handleFirstYearQuarterChange = (newValue: YearQuarterInput.YearQuarter | null) => {
        if (secondYearQuarter && newValue && (secondYearQuarter.year < newValue.year || (secondYearQuarter.year === newValue.year && secondYearQuarter.quarter < newValue.quarter))) {
            setFirstYearQuarter(null);
            addNewAlert({ message: "You cannot choose a value greater than the other.", type: "danger" });
            return;
        };
        setFirstYearQuarter(newValue);
    };

    const handleSecondYearQuarterChange = (newValue: YearQuarterInput.YearQuarter | null) => {
        if (firstYearQuarter && newValue && (firstYearQuarter.year > newValue.year || (firstYearQuarter.year === newValue.year && firstYearQuarter.quarter > newValue.quarter))) {
            setSecondYearQuarter(null);
            addNewAlert({ message: "You cannot choose a value lower than the other.", type: "danger" });
            return;
        };
        setSecondYearQuarter(newValue);
    };

    const handleCountryChange = (newCountry: string) => {
        setCountry(newCountry);
        setSite("");
        setSiteOptions(siteOptionsList[newCountry] || []);
    };

    const handleSiteChange = (newSite: string) => {
        setSite(newSite);
    };

    const handleApplyFiltersButtonClick = () => {
        let filters: SectionModule.Filters = {};

        if (country) filters.country = country;
        if (country && site) filters.site = site;

        if (firstYearQuarter) filters.firstYearQuarter = { ...firstYearQuarter };
        if (secondYearQuarter) filters.secondYearQuarter = { ...secondYearQuarter };

        if (deepEqual(filters, currentlyAppliedFilterValues)) return;

        setCurrentlyAppliedFilterValues(filters);
        console.log(filters);
    };

    return (
        <div id={id} className="w-full rounded-[15px] flex flex-col items-center gap-[10px] px-[38px] py-[24px] bg-white shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)] relative">
            <div className="flex items-center justify-center gap-[6px]">
                <SvgRenderer svgContent={sectionData.icon} width={46} height={46} className="text-primary" /> <p className="text-2xl font-bold text-primary">{sectionData.label}</p>
            </div>
            <div className="z-10 w-full flex flex-col gap-[20px] bg-white/80 backdrop-blur-[21px] p-[20px] rounded-[15px] border-white border transition-all">
                <div className="w-full relative z-[12] gap-[20px] flex items-center">
                    <span className="text-primary font-bold">Display data only between:</span>
                    <YearQuarterInput value={firstYearQuarter} onChange={handleFirstYearQuarterChange} onChangeHandleValueChange={true} />
                    <span className="text-primary font-bold">and:</span>
                    <YearQuarterInput value={secondYearQuarter} onChange={handleSecondYearQuarterChange} onChangeHandleValueChange={true} />
                </div>
                <span className="italic text-sm text-text">If you set only one year quarter, the data will be display only for this one.</span>
                <div className="w-full relative z-[11] gap-[20px] flex items-center">
                    <span className="text-primary font-bold">Display data only for:</span>
                    <div className="w-[250px]"><Select value={country} onChange={handleCountryChange} onChangeHandleValueChange={true} placeholder="Select a country" options={coutryOptionsList} /></div>
                    <span className="text-primary font-bold">and for:</span>
                    <div className="w-[250px]"><Select value={site} onChange={handleSiteChange} onChangeHandleValueChange={true} placeholder="Select a site" options={siteOptions} /></div>
                </div>
                <Button onClick={handleApplyFiltersButtonClick}>Reload data with filters</Button>
            </div>

            <div className="w-full h-[1px] bg-gray-light"></div>
            <div className="w-full grid grid-cols-2 gap-x-[40px] gap-y-[20px] pt-[20px] px-[10px]">
                {
                    sectionData.charts.length > 0 &&

                    sectionData.charts.map((chartSettings) => (
                        <ChartClient key={`${chartSettings.label}${chartSettings.type}${chartSettings.aggregationType}`} className="w-full h-auto"
                            categoryName={sectionData.categoryName}
                            chartSettings={chartSettings}
                            filters={currentlyAppliedFilterValues}
                            options={{
                                responsive: false,
                                maintainAspectRatio: true,
                            }}
                        ></ChartClient>
                    ))
                }
            </div>
        </div>
    );
};

export { Section };