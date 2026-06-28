import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
    value: string;
    onChange: (val: string) => void;
}

export const SearchInput = React.memo(({value, onChange}: SearchInputProps) => (
    <div className="relative w-full md:w-80">
        <input
            type="text"
            placeholder="Searching for reports..."
            value={ value }
            onChange={ (e) => onChange(e.target.value) }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest text-sm text-on-wg-surface outline-none transition-colors focus:border-wg-primary focus:ring-1 focus:ring-wg-primary"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-wg-surface-variant"/>
    </div>
));

SearchInput.displayName = "SearchInput";