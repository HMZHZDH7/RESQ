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
import { comparators, variables } from "@/data/custom-variables";
import { SearchableSelect } from "./inputs/searchable-select";
import { SECTIONS } from "@/data/sections";

interface SectionProps {
    id: string;
    sectionData: SectionModule.Data;
};

const Section = ({ id, sectionData }: SectionProps) => {
    const { addNewAlert } = useContext(AlertContext);

    const countryOptionsList: SelectInput.Option[] = Object.keys(tempCoutriesWithSites).map(tCWS => ({ value: tCWS, label: tCWS }));
    const siteOptionsList: Record<string, SelectInput.Option[]> = (Object.keys(tempCoutriesWithSites) as (keyof typeof tempCoutriesWithSites)[]).reduce((acc, current) => {
        acc[current] = tempCoutriesWithSites[current].map(tCWS => ({ value: tCWS, label: tCWS }));
        return acc;
    }, {} as Record<string, SelectInput.Option[]>);

    // console.log(sectionData.id, sectionData.label)
    const imagingList = sectionData.label;

    const comparisonOptionsList: SelectInput.Option[] = comparators.map(cmp => ({ value: cmp, label: cmp }));

    const [firstYearQuarter, setFirstYearQuarter] = useState<YearQuarterInput.YearQuarter | null>(null);
    const [secondYearQuarter, setSecondYearQuarter] = useState<YearQuarterInput.YearQuarter | null>(null);

    const [country, setCountry] = useState<string>("");
    const [site, setSite] = useState<string>("");
    const [siteOptions, setSiteOptions] = useState<SelectInput.Option[]>([]);

    const [variable, setVariable] = useState<string>('');
    const [comparison, setComparison] = useState<string>("");
    const [comparisonValue, setComparisonValue] = useState<string>("");

    // console.log(variable)
    const [currentlyAppliedFilterValues, setCurrentlyAppliedFilterValues] = useState<SectionModule.Filters>({});

    const [showMedianHospital, setShowMedianHospital] = useState(false);
    const [stats, setStats] = useState<Record<string, { value: number | null, significant: "positive" | "negative" | "neutral", diffMedian: number | null, pctEvolution: string | null }>>({});

    const handleStats = (label: string, pValueObj: { value: number | null, significant: "positive" | "negative" | "neutral", diffMedian: number | null, pctEvolution: string | null }) => {
        setStats(prev => ({ ...prev, [label]: pValueObj }));
    };

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

        // if (variable) filters.variables = variable;
        if (comparison) filters.comparators = comparison;
        if (comparisonValue) filters.comparisonValue = comparisonValue;

        if (deepEqual(filters, currentlyAppliedFilterValues)) return;

        setCurrentlyAppliedFilterValues(filters);
    };

    const handleShowMedianHospital = (e: any) => {
        setShowMedianHospital(e.target.checked);
    }; 

    const handleVariableChange = (newVariable: string) => {
        setVariable(newVariable);
    };


    const handleComparisonChange = (newComparison: string) => {
        setComparison(newComparison);
    };

    const handleComparisonValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setComparisonValue(e.target.value);
    };

    return (
        <div id={id} className="w-full rounded-[15px] flex flex-col items-center gap-[10px] px-[38px] py-[24px] bg-white shadow-[0px_3.5px_5.5px_0px_rgba(0,_0,_0,_0.02)] relative">
            <div className="flex items-center justify-center gap-[6px]">
                <SvgRenderer svgContent={sectionData.icon} width={46} height={46} className="text-primary" /> <p className="text-2xl font-bold text-primary">{sectionData.label}</p>
            </div>
            <div className="z-10 w-full flex flex-row items-start justify-between gap-[20px] bg-white/80 backdrop-blur-[21px] p-[20px] rounded-[15px] border-white border transition-all">
                <div className="flex-1 flex flex-col gap-[16px]">
                    <div className="w-full relative z-[12] gap-[20px] flex items-center flex-wrap">
                        <span className="text-primary font-bold">Display data only between:</span>
                        <YearQuarterInput value={firstYearQuarter} onChange={handleFirstYearQuarterChange} onChangeHandleValueChange={true} />
                        <span className="text-primary font-bold">and:</span>
                        <YearQuarterInput value={secondYearQuarter} onChange={handleSecondYearQuarterChange} onChangeHandleValueChange={true} />
                    </div>
                    <span className="italic text-sm text-text">If you set only one year quarter, the data will be display only for this one.</span>
                    <div className="w-full relative z-[11] gap-[20px] flex items-center flex-wrap">
                        <span className="text-primary font-bold">Display data only for:</span>
                        <div className="w-[250px]"><Select value={country} onChange={handleCountryChange} onChangeHandleValueChange={true} placeholder="Select a country" options={countryOptionsList} /></div>
                        <span className="text-primary font-bold">and for:</span>
                        <div className="w-[250px]"><Select value={site} onChange={handleSiteChange} onChangeHandleValueChange={true} placeholder="Select a site" options={siteOptions} /></div>
                    </div>
                    {sectionData.categoryName === "custom_variables" && (
                        <div className="z-10 w-full flex flex-row items-start justify-between gap-[20px] bg-white/80 backdrop-blur-[21px] p-[20px] rounded-[15px] border-white border transition-all">
                            <div className="flex-1 flex flex-col gap-[16px]">
                                <div className="w-full relative z-[12] gap-[20px] flex items-center flex-wrap">
                                    <span className="text-primary font-bold">% of patient with:</span>
                                    {/* <div className="w-[250px]"><SearchableSelect value={variable} onChange={handleVariableChange} placeholder="Select a variable" options={variableOptionsList} /></div> */}
                                    <div className="w-[250px]"><Select value={comparison} onChange={handleComparisonChange} onChangeHandleValueChange={true} placeholder="Select a comparator" options={comparisonOptionsList} /></div>
                                    <div className="flex flex-col w-[120px]">
                                        <input
                                            type="text"
                                            placeholder="Enter a value"
                                            value={comparisonValue}
                                            onChange={handleComparisonValueChange}
                                            className="border border-gray-500 w-full rounded-md px-2 py-1 text-sm"
                                        />
                                    </div>

                                </div>

                            </div>
                        </div>
                    )}
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showMedianHospital}
                            onChange={handleShowMedianHospital}
                        />
                        <span>Hospital Median</span>
                    </label>
                </div>
                        <div className="w-[400px] max-h-[250px] overflow-y-auto border rounded-lg shadow-sm">
                            <table className="w-full text-sm border border-gray-200">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Name</th>
                                        <th className="p-2 text-left">pValue</th>
                                        <th className="p-2 text-left">Difference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sectionData.charts.map((chart) => {
                                        const stat = stats[chart.label];
                                        const pValue = stat?.value ?? null;
                                        const significant = stat?.significant ?? "neutral";
                                        const pctEvolution = stat?.pctEvolution ?? null;  

                                        let displayPValue = pValue !== null ? pValue.toFixed(4) : "—";
                                        let displayPctEvolution = pctEvolution !== null ? pctEvolution : "—";

                                        let valueCellStyle = "";
                                        if (significant === "positive") {
                                            displayPValue = `+${displayPValue}`;
                                            valueCellStyle = "bg-green-100 text-green-800 font-semibold";
                                        } else if (significant === "negative") {
                                            displayPValue = `-${displayPValue}`;
                                            valueCellStyle = "bg-red-100 text-red-800 font-semibold";
                                        } else {
                                            valueCellStyle = ""; // neutre
                                        }

                                        let pctCellStyle = "";
                                        if (pctEvolution !== null && pctEvolution !== "_") {
                                            const pctValue = parseFloat(pctEvolution.replace("%", ""));

                                            if (Math.abs(pctValue) >= 10) {
                                                if (pctValue > 0) {
                                                    pctCellStyle = "bg-green-100 text-green-800 font-semibold";
                                                } else {
                                                    pctCellStyle = "bg-red-100 text-red-800 font-semibold";
                                                }
                                            }
                                        }

                                        return (
                                            <tr key={chart.label}>
                                                <td className="p-2">{chart.label}</td>
                                                <td className={`p-2 ${valueCellStyle}`}>{displayPValue}</td>
                                                <td className={`p-2 ${pctCellStyle}`}>{displayPctEvolution}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>  
                            </table>
                        </div>
                    </div> 
                    <Button onClick={handleApplyFiltersButtonClick} className="w-full">Reload data with filters</Button>
                    <div className="w-full h-[1px] bg-gray-light"></div>
                    <div className="w-full grid grid-cols-2 gap-x-[40px] gap-y-[20px] pt-[20px] px-[10px]">
                        {
                            sectionData.charts.length > 0 &&

                            sectionData.charts.map((chartSettings) => (
                                <ChartClient key={`${chartSettings.label}${chartSettings.type}${chartSettings.aggregationType}`} className="w-full h-auto"
                                    categoryName={sectionData.categoryName}
                                    chartSettings={chartSettings}
                                    filters={currentlyAppliedFilterValues}
                                    showMedianHospital={showMedianHospital}
                                    options={{
                                        responsive: false,
                                        maintainAspectRatio: true,
                                    }}
                                    onPValue={handleStats}
                                ></ChartClient>
                            ))
                        }
                    </div>
                
        </div>
    );
};

export { Section };