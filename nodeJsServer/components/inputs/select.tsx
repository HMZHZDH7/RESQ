"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SelectArrowIcon } from "@/components/icons/select-arrow";
import { CrossCircleIcon } from "@/components/icons/cross-circle";

interface SelectProps {
    options: SelectInput.Option[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    onChangeHandleValueChange?: boolean;
}

const Select = (
    ({ options, value, onChange, placeholder = "Select an element", className, onChangeHandleValueChange }: SelectProps) => {
        const [showOptions, setShowOptions] = useState<boolean>(false);
        const [selectedValue, setSelectedValue] = useState<string | undefined>(value);
        const containerRef = useRef<HTMLDivElement | null>(null);
        const optionsRef = useRef<HTMLDivElement | null>(null);
        const crossIconRef = useRef<HTMLDivElement | null>(null);

        // Synchronize external value changes
        useEffect(() => {
            setSelectedValue(value);
        }, [value]);

        const toggleDropdown = () => setShowOptions((prev) => !prev);
        const closeDropdown = () => setShowOptions(false);
        const setNewValue = (newValue: string) => {
            if (onChange) {
                onChange(newValue);
                if (onChangeHandleValueChange) return;
            };
            setSelectedValue(value);
        };

        const handleSelectElementClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (!containerRef.current || !optionsRef.current || !crossIconRef.current || !(event.target instanceof Element)) return;
            if (optionsRef.current.contains(event.target) || optionsRef.current.isSameNode(event.target)) return;

            if (selectedValue && (crossIconRef.current.contains(event.target) || crossIconRef.current.isSameNode(event.target))) return;

            toggleDropdown();
        };

        const handleOptionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, optionValue: string) => {
            setNewValue(optionValue);
            closeDropdown();
        };

        const handleWindowClick = (event: MouseEvent) => {
            if (!containerRef.current || !(event.target instanceof Element)) return;

            if (containerRef.current.contains(event.target) || !document.contains(event.target)) return;

            closeDropdown();
        };

        const handleCrossIconClick = () => {
            if (selectedValue) setNewValue("");
        };

        // Handle click outside to close dropdown
        useEffect(() => {
            window.addEventListener("click", handleWindowClick);
            return () => {
                window.removeEventListener("click", handleWindowClick);
            };
        }, []);

        return (
            <div ref={containerRef}
                className="w-full h-[48px] overflow-y-visible flex flex-col"
                onClick={handleSelectElementClick}>
                <div className={cn(
                    "w-full h-[48px] shrink-0 rounded-[4px] flex items-center px-[24px] bg-background border border-gray-light hover:border-secondary cursor-pointer transition gap-[12px]",
                    showOptions && "rounded-b-none !border-primary",
                    className
                )}>
                    <span className="text-text flex-grow">{selectedValue ? options.find((o) => o.value === selectedValue)?.label : placeholder}</span>
                    <div ref={crossIconRef} onClick={handleCrossIconClick} className={cn(
                        "items-center justify-center group",
                        selectedValue ? "flex" : "hidden"
                    )}>
                        <CrossCircleIcon className="text-text group-hover:text-red-600 transition" width={16} height={16} />
                    </div>

                    <div className="h-3/5 w-[1px] bg-gray-light" />
                    <SelectArrowIcon width={8} height={8} className={cn(
                        "transition-transform duration-300 ease-in-out rotate-0 fill-gray-dark",
                        showOptions && "rotate-180 fill-primary")} />
                </div>
                <div ref={optionsRef}
                    className={cn(
                        "hidden cursor-auto w-full rounded-b-[4px] flex-col py-[6px] gap-[6px] bg-accent",
                        showOptions && "flex"
                    )}>

                    {options.map((option, index) => (
                        <div key={index}
                            className="w-full cursor-pointer flex px-[24px] py-[6px] text-background hover:text-accent hover:bg-background transition"
                            onClick={(event) => handleOptionClick(event, option.value)}>
                            {option.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

export { Select };