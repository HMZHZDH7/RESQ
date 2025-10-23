"use client";

import { useState } from "react";

export interface SearchableSelectOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().startsWith(search.toLowerCase())
    );

    const selectedLabel =
        options.find(opt => opt.value === value)?.label || placeholder || "Select...";

    return (
        <div className="relative w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="border border-gray-400 rounded-lg px-3 py-2 cursor-pointer flex justify-between items-center bg-white"
            >
                <span>{selectedLabel}</span>
                <span className="text-gray-500 text-sm">▼</span>
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full border-b border-gray-300 px-3 py-2 focus:outline-none"
                    />
                    <ul className="max-h-[120px] overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <li
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                                setSearch("");
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                                opt.value === value ? "bg-gray-200 font-semibold" : ""
                            }`}
                            >
                            {opt.label}
                            </li>
                        ))
                        ) : (
                        <li className="px-3 py-2 text-gray-500 italic">No results</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
export {SearchableSelect};