import {
    Search,
    ArrowUpDown,
    Filter,
    ChevronDown,
    RotateCcw,
} from "lucide-react";
import React, { useState, useEffect } from "react";

export interface FilterOption {
    label: string;
    value: string;
}

interface ReportFilterBarProps {
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    sortOptions: FilterOption[];
    onReset?: () => void; // Thêm prop onReset
    children?: React.ReactNode;
}

export function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    children: React.ReactNode;
}) {
    const selectedOption = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.props.value === value,
    );
    const displayText = React.isValidElement(selectedOption)
        ? selectedOption.props.children
        : "All";

    return (
        <div className="relative flex items-center bg-wg-surface-container border border-wg-outline-variant/80 rounded-lg h-[40px] px-3 focus-within:border-wg-primary focus-within:ring-1 focus-within:ring-wg-primary transition-all hover:bg-wg-surface-variant/30">
            <span className="text-[11px] font-bold text-on-wg-surface-variant uppercase tracking-wider mr-1.5 shrink-0">
                {label}:
            </span>
            <span className="text-sm font-medium text-on-wg-surface mr-6 whitespace-nowrap">
                {displayText as React.ReactNode}
            </span>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-wg-surface-variant pointer-events-none" />

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
                {children}
            </select>
        </div>
    );
}

export const ReportFilterBar = React.memo(function ReportFilterBar({
    onSearchChange,
    sortBy,
    onSortChange,
    sortOptions,
    onReset,
    children,
}: ReportFilterBarProps) {
    const [localSearch, setLocalSearch] = useState("");

    const selectedSortOption = sortOptions.find((opt) => opt.value === sortBy);
    const sortDisplayText = selectedSortOption
        ? selectedSortOption.label
        : "Sort";

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    const handleClearAll = () => {
        setLocalSearch(""); 
        if (onReset) onReset();
    };

    return (
        <div className="relative z-20 flex flex-col gap-3 bg-wg-surface/60 backdrop-blur-sm p-3 rounded-xl border border-wg-outline-variant/30 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wg-on-surface-variant w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 h-[40px] bg-wg-surface-container rounded-lg border border-wg-outline-variant focus:outline-none focus:border-wg-primary focus:ring-1 focus:ring-wg-primary transition-all text-sm"
                    />
                </div>

                {/* Sort */}
                <div className="relative flex items-center bg-wg-surface-container border border-wg-outline-variant rounded-lg px-3 h-[40px] focus-within:border-wg-primary focus-within:ring-1 focus-within:ring-wg-primary transition-all w-full sm:w-auto">
                    <ArrowUpDown className="w-4 h-4 text-on-wg-surface-variant shrink-0 mr-1.5" />
                    <span className="text-[11px] font-bold text-on-wg-surface-variant uppercase tracking-wider shrink-0 mr-1.5">
                        Sort:
                    </span>
                    <span className="text-sm font-medium text-on-wg-surface mr-6 whitespace-nowrap">
                        {sortDisplayText}
                    </span>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-wg-surface-variant pointer-events-none" />

                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Filter tags and Reset Button */}
            {(children || onReset) && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex-1 flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-on-wg-surface-variant text-xs font-bold uppercase tracking-wider mr-1">
                            <Filter className="w-3.5 h-3.5" /> Filters
                        </div>

                        {children}
                    </div>

                    {onReset && (
                        <button
                            onClick={handleClearAll}
                            className="btn btn-ghost"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});
