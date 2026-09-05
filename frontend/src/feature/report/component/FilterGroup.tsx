import React from "react";

interface FilterGroupProps {
    activeFilter: string;
    filters: string[];
    totalElements?: number;
    onChange: (filter: string) => void;
}

export const FilterGroup = React.memo(({activeFilter, filters, totalElements = 0, onChange}: FilterGroupProps) => (
    <div className="flex flex-wrap items-center gap-2">
        { filters.map((filter) => (
            <button
                key={ filter }
                onClick={ () => onChange(filter) }
                className={ `px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeFilter === filter
                        ? "bg-wg-primary text-on-wg-primary shadow-sm"
                        : "bg-wg-surface-container-lowest border border-wg-outline-variant text-on-wg-surface hover:bg-wg-surface-container"
                }` }
            >
                { filter }
            </button>
        )) }
        <p className="ml-auto text-sm ">{`Found ${totalElements} results`}</p>
    </div>
));

FilterGroup.displayName = "FilterGroup";