"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "@/components/icons/calendar";
import { ArrowIcon } from "@/components/icons/arrow";
import { CrossCircleIcon } from "@/components/icons/cross-circle";

interface YearQuarterInputProps {
    value?: YearQuarterInput.YearQuarter | null;
    onChange?: (value: YearQuarterInput.YearQuarter | null) => void;
    onChangeHandleValueChange?: boolean;
};

const YearQuarterInput = ({ value, onChange, onChangeHandleValueChange = false }: YearQuarterInputProps) => {
    const startYear = Math.floor(new Date(0).getFullYear() / 10) * 10;
    const currentTensYear = Math.floor(new Date().getFullYear() / 10) * 10;
    const endYear = currentTensYear + 100;

    const [selectedValue, setSelectedValue] = useState<YearQuarterInput.YearQuarter | undefined | null>(null);
    const tempValue = useRef<YearQuarterInput.YearQuarter>({ year: 0, quarter: 0 });
    const [currentTensYearToDisplay, setCurrentTensYearToDisplay] = useState<number>(currentTensYear);
    const [state, setState] = useState<"closed" | "choosing-year" | "choosing-quarter">("closed");
    const selectRef = useRef<HTMLDivElement | null>(null);
    const optionsRef = useRef<HTMLDivElement | null>(null);
    const iconRef = useRef<HTMLDivElement | null>(null);

    const yearIterator = Array.apply(null, Array(11)).map(function (_, i) { return i; });
    const quarterIterator = Array.apply(null, Array(4)).map(function (_, i) { return i; });

    // Synchronize external value changes
    useEffect(() => {
        setSelectedValue(value);
    }, [value?.quarter, value?.year]);

    const closeDropdown = () => {
        setState("closed");
        setCurrentTensYearToDisplay(currentTensYear);
    };

    const setNewValue = (newValue: { year: number, quarter: number } | null) => {
        const clonedNewValue = newValue ? { ...newValue } : null;
        if (onChange) {
            onChange(clonedNewValue);
            if (onChangeHandleValueChange) return;
        };
        setSelectedValue(clonedNewValue);
    };

    const handleFilterClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!selectRef.current || !optionsRef.current || !iconRef.current || !(event.target instanceof Element)) return;
        if (optionsRef.current.contains(event.target) || optionsRef.current.isSameNode(event.target)) return;
        if (selectedValue && state === "closed" && (iconRef.current.contains(event.target) || iconRef.current.isSameNode(event.target))) return;

        if (state === "closed") setState("choosing-year")
        else closeDropdown();
    };

    const handleWindowClick = (event: MouseEvent) => {
        if (!selectRef.current || !(event.target instanceof Element)) return;

        if (selectRef.current.contains(event.target) || !document.contains(event.target)) return;

        if (state === "closed") return;
        closeDropdown();
    };

    const handleYearClick = (year: number) => {
        tempValue.current.year = year;
        setState("choosing-quarter");
    };

    const handleQuarterClick = (quarter: number) => {
        tempValue.current.quarter = quarter + 1;
        setNewValue(tempValue.current);
        closeDropdown();
    };

    const handleIconClick = () => {
        if (selectedValue && state === "closed") setNewValue(null);
    };

    useEffect(() => {
        window.addEventListener("click", handleWindowClick);
        return () => {
            window.removeEventListener("click", handleWindowClick);
        };
    }, [state]);

    return <div ref={selectRef} onClick={handleFilterClick} className="w-[250px] h-[48px] overflow-y-visible flex flex-col">
        <div className={cn(
            "w-full h-[48px] shrink-0 rounded-[4px] flex items-center justify-between px-[24px] bg-background border border-gray-light hover:border-secondary cursor-pointer transition",
            state !== "closed" && "rounded-b-none !border-primary"
        )}>
            <span className={cn(
                "text-text",
                state !== "closed" && "text-primary"
            )}>
                {selectedValue && state === "closed" ? `${selectedValue.year} | Q${selectedValue.quarter}` : "Select year quarter"}
            </span>
            <div ref={iconRef} onClick={handleIconClick} className="w-[26px] flex items-center justify-center group">
                {
                    selectedValue && state === "closed" ? (
                        <CrossCircleIcon width={16} height={16} className="text-text group-hover:text-red-600 transition" />
                    ) : (
                        <CalendarIcon className={cn(
                            "fill-text",
                            state !== "closed" && "fill-primary"
                        )} width={26} height={26} />
                    )
                }
            </div>
        </div>
        <div ref={optionsRef} className={cn(
            "hidden cursor-auto w-full border border-accent rounded-b-[4px] flex-col items-center bg-accent",
            state !== "closed" && "flex"
        )}>
            {
                state === "choosing-year" && (<>
                    <div className="w-full flex items-center px-[20px] py-[6px]">
                        <div onClick={() => { if (currentTensYearToDisplay > startYear) setCurrentTensYearToDisplay((value) => value - 10) }}><ArrowIcon className={cn("fill-background rotate-180 cursor-pointer select-none", currentTensYearToDisplay <= startYear && "opacity-0 cursor-default")} width={22} height={22} /></div>

                        <span className="font-bold text-center text-sm text-background flex-grow">{`${currentTensYearToDisplay}-${currentTensYearToDisplay + 10}`}</span>

                        <div onClick={() => { if (currentTensYearToDisplay < endYear) setCurrentTensYearToDisplay((value) => value + 10) }}><ArrowIcon className={cn("fill-background cursor-pointer select-none", currentTensYearToDisplay >= endYear && "opacity-0 cursor-default")} width={22} height={22} /></div>
                    </div>
                    <div className="grid grid-cols-3 w-full gap-y-[4px] pb-[6px]">
                        {
                            yearIterator.map(i => (
                                <div key={currentTensYearToDisplay + i} className="flex items-center justify-center text-sm font-bold text-background">
                                    <div onClick={() => handleYearClick(currentTensYearToDisplay + i)} className={cn("rounded-[4px] px-[16px] py-[5px] cursor-pointer hover:text-primary hover:bg-background transition select-none", selectedValue?.year === currentTensYearToDisplay + i && "text-text bg-background")}>{currentTensYearToDisplay + i}</div>
                                </div>
                            ))
                        }
                    </div>
                </>)
            }
            {
                state === "choosing-quarter" && (<>
                    <div className="grid grid-cols-2 w-full gap-[20px] p-[20px]">
                        {
                            quarterIterator.map(i => (
                                <div key={i} className="flex items-center justify-center font-bold text-background">
                                    <div onClick={() => handleQuarterClick(i)} className={cn("flex-grow text-center rounded-[4px] px-[16px] py-[2px] cursor-pointer hover:text-primary hover:bg-background transition select-none", (selectedValue?.year === tempValue.current.year && selectedValue.quarter === i + 1) && "text-text bg-background")}>{tempValue.current.year}<br />Q{i + 1}</div>
                                </div>
                            ))
                        }
                    </div>
                </>)
            }
        </div>
    </div>
};

export { YearQuarterInput };