import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import SelectArrowIcon from "@/components/icons/select-arrow";

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const UserSelect = (
    ({ options, value, onChange, placeholder = "Select an element", className, }: SelectProps) => {
        const [showOptions, setShowOptions] = useState<boolean>(false);
        const [selectedValue, setSelectedValue] = useState<string | undefined>(value);
        const containerRef = useRef<HTMLDivElement | null>(null);

        // Synchronize external value changes
        useEffect(() => {
            setSelectedValue(value);
        }, [value]);

        const toggleDropdown = () => setShowOptions((prev) => !prev);
        const closeDropdown = () => setShowOptions(false);

        const handleSelectElementClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation();
            toggleDropdown();
        };

        const handleSelectOptionsZoneClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation();
        };

        const handleOptionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, optionValue: string) => {
            event.stopPropagation();
            closeDropdown();
            onChange(optionValue);
        };

        // Handle click outside to close dropdown
        useEffect(() => {
            window.addEventListener("click", closeDropdown);
            return () => {
                window.removeEventListener("click", closeDropdown);
            };
        }, []);

        return (
            <div ref={containerRef}
                className={cn(
                    "relative cursor-pointer min-w-[100px] h-[36px] text-sm rounded-[4px] flex items-center justify-between px-[10px] bg-background box-content border border-gray-light",
                    showOptions && "rounded-b-[0px] border-primary",
                    className)}
                onClick={handleSelectElementClick}>

                <span className="text-text">{selectedValue ? options.find((o) => o.value === selectedValue)?.label : placeholder}</span>
                <SelectArrowIcon width={8} height={8} className={cn(
                    "transition-transform duration-300 ease-in-out rotate-0",
                    showOptions && "rotate-180")} />

                <div
                    className={cn(
                        "hidden absolute cursor-default left-[-1px] top-full min-w-full rounded-b-[4px] flex-col py-[6px] gap-[6px] bg-accent border border-primary box-content",
                        showOptions && "flex"
                    )}
                    onClick={handleSelectOptionsZoneClick}>

                    {options.map((option, index) => (
                        <div key={index}
                            className="cursor-pointer flex px-[10px] py-[6px] text-background hover:text-accent hover:bg-background transition"
                            onClick={(event) => handleOptionClick(event, option.value)}>
                            {option.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

export default UserSelect;