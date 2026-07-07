import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    AlertTriangle,
    ClipboardClock,
    ClipboardList,
    LogIn,
    MapPinPlus,
    Search,
    History,
    User,
    MapPin,
    Loader2,
    MoveLeft,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { mapApi } from "@/api";

export interface HistoricalMatch {
    name: string;
    formattedAddress: string;
}

export interface SearchLocation {
    locationId: string;
    name: string;
    formattedAddress: string;
    historicalMatches?: HistoricalMatch[];
    timestamp?: string;
}

interface HeaderProps {
    onSearchSelect?: (locationId: string) => void;
}

export default function Header({ onSearchSelect }: HeaderProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const role = user?.role;

    // Check current route to determine if we are on the Home page
    const location = useLocation();
    const isHome = location.pathname === "/home" || location.pathname === "/";

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<SearchLocation[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Version history (depth) controls
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [depth, setDepth] = useState<number | null>(null);
    const depthOptions = [1, 3, 5, 10];

    const handleToggleHistoryPanel = () => {
        // Opening the history panel should also open the dropdown so it's visible
        setShowDropdown(true);
        setShowHistoryPanel((prev) => !prev);
    };

    const handleSelectDepth = (value: number) => {
        // Clicking the already-selected depth clears it (toggle off)
        setDepth((prev) => (prev === value ? null : value));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (!val.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    // Search with debounce to avoid too many API calls
    useEffect(() => {
        if (!isHome || searchTerm.trim().length === 0) return;

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            setShowDropdown(true);
            // Searching always brings the user back to the results view
            setShowHistoryPanel(false);
            try {
                // Only pass `depth` when the user has explicitly picked a
                // version-back value from the History panel. Otherwise the
                // call behaves exactly as before (no depth param).
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any =
                    depth != null
                        ? await mapApi.searchLocation(searchTerm, depth)
                        : await mapApi.searchLocation(searchTerm);

                // Trích xuất mảng dữ liệu an toàn
                const actualResults =
                    response?.data?.details ||
                    response?.details ||
                    response?.data ||
                    response;
                setSearchResults(
                    Array.isArray(actualResults) ? actualResults : [],
                );
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 700);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isHome, depth]);

    // Auto close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle selection of a search result
    const handleSelectResult = (locationId: string) => {
        if (!locationId) {
            return;
        }
        setShowDropdown(false);
        setSearchTerm("");
        if (onSearchSelect) {
            onSearchSelect(locationId);
        }
    };

    return (
        <header className="sticky top-0 z-50 text-sm text-on-wg-surface-variant">
            <div className="flex items-center gap-2 md:gap-4 border border-wg-outline-variant/80 bg-wg-surface-container-lowest px-2 sm:px-4 py-2 shadow-[0_6px_20px_rgba(15,23,42,0.06)] backdrop-blur-md">
                <Link to="/home" className="shrink-0">
                    <img
                        src="/icon-1.png"
                        alt="Logo"
                        className="size-8 md:size-10"
                    />
                </Link>

                <div className="relative flex-1 max-w-2xl" ref={dropdownRef}>
                    <label
                        className={`flex h-10 md:h-12 w-full items-center gap-2 md:gap-3 rounded-[1.25rem] border border-wg-outline-variant/70 px-3 md:px-4 transition ${
                            isHome
                                ? "bg-wg-surface focus-within:border-wg-primary/40 focus-within:bg-wg-surface-container-lowest focus-within:shadow-[0_8px_20px_rgba(0,91,191,0.08)] cursor-text"
                                : "bg-gray-100 opacity-50 cursor-not-allowed"
                        }`}
                        aria-label="Search places"
                    >
                        <Search className="h-4 w-4 shrink-0 text-wg-primary/70" />
                        <input
                            type="search"
                            placeholder={
                                isHome
                                    ? "Search locations..."
                                    : "Search is only available on the Home page"
                            }
                            disabled={!isHome}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                if (searchTerm.trim().length > 0)
                                    setShowDropdown(true);
                            }}
                            className="w-full min-w-0 border-0 bg-transparent text-sm text-on-wg-surface outline-none placeholder:text-on-wg-surface-variant/70 disabled:cursor-not-allowed"
                        />
                        {isSearching && (
                            <Loader2 className="h-4 w-4 animate-spin text-wg-primary" />
                        )}
                        <button
                            type="button"
                            onClick={handleToggleHistoryPanel}
                            disabled={!isHome}
                            title="Search results from an earlier version"
                            aria-pressed={showHistoryPanel}
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed ${
                                showHistoryPanel || depth != null
                                    ? "bg-wg-primary/10 text-wg-primary"
                                    : "text-wg-primary/70 hover:bg-wg-primary/10"
                            }`}
                        >
                            <History className="h-5 w-5" />
                        </button>
                    </label>

                    {isHome &&
                        showDropdown &&
                        (showHistoryPanel || searchTerm.trim().length > 0) && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto z-50">
                                {showHistoryPanel ? (
                                    <div className="p-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowHistoryPanel(false)
                                                }
                                                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                            >
                                                <MoveLeft />
                                            </button>
                                            <div className="flex flex-1 gap-1.5">
                                                {depthOptions.map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectDepth(
                                                                value,
                                                            )
                                                        }
                                                        className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                                                            depth === value
                                                                ? "bg-wg-primary text-white"
                                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                        }`}
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {depth != null && (
                                            <p className="mt-2 text-[12px] text-gray-400">
                                                Next search will look {depth}{" "}
                                                version
                                                {depth > 1 ? "s" : ""} back.
                                                Click{" "}
                                                <span className="font-medium text-wg-primary">
                                                    {depth}
                                                </span>{" "}
                                                again to clear.
                                            </p>
                                        )}
                                    </div>
                                ) : isSearching ? (
                                    <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="space-y-0.5">
                                        {searchResults.map((item, index) => (
                                            <li key={item.locationId || index}>
                                                <button
                                                    onClick={() =>
                                                        handleSelectResult(
                                                            item.locationId,
                                                        )
                                                    }
                                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                                                >
                                                    <MapPin
                                                        className="text-blue-500 shrink-0 mt-0.5"
                                                        size={18}
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-gray-800">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 line-clamp-1">
                                                            {
                                                                item.formattedAddress
                                                            }
                                                        </span>

                                                        {item.historicalMatches &&
                                                            item
                                                                .historicalMatches
                                                                .length > 0 && (
                                                                <div className="mt-1.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                                                                    {item.historicalMatches.map(
                                                                        (
                                                                            match,
                                                                            mIndex,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    mIndex
                                                                                }
                                                                                className="leading-tight"
                                                                            >
                                                                                <span className="block text-[11px] text-gray-400">
                                                                                    {
                                                                                        match.name
                                                                                    }
                                                                                </span>
                                                                                <span className="block text-[10px] text-gray-400/70 line-clamp-1">
                                                                                    {
                                                                                        match.formattedAddress
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                </div>

                {/* User Actions Menu */}
                <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-1">
                    {isAuthenticated && role === "admin" && (
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost px-2 sm:px-3"
                            >
                                <ClipboardClock size={20} />
                                <span className="hidden md:block text-[14px]">
                                    Pending Tasks
                                </span>
                            </div>
                            <ul
                                tabIndex={-1}
                                className="dropdown-content menu bg-base-100 rounded-box z-1 w-46 p-2 shadow-sm border border-wg-outline-variant/70 mt-2"
                            >
                                <li>
                                    <Link to="/admin/incident-reports/pending">
                                        <AlertTriangle size={18} />
                                        <span>Incident reports</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/location-reports/pending">
                                        <MapPinPlus size={18} />
                                        <span>Location reports</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}

                    {isAuthenticated && role === "user" && (
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost px-2 sm:px-3"
                            >
                                <ClipboardList size={20} />
                                <span className="hidden md:block text-[14px]">
                                    My Reports
                                </span>
                            </div>
                            <ul
                                tabIndex={-1}
                                className="dropdown-content menu bg-base-100 rounded-box z-1 w-48 p-2 shadow-sm border border-wg-outline-variant/70 mt-2"
                            >
                                <li>
                                    <Link to="/my-reports/incidents">
                                        <AlertTriangle size={18} />
                                        <span>Incident reports</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/my-reports/locations">
                                        <MapPinPlus size={18} />
                                        <span>Location reports</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}

                    {isAuthenticated && role === "admin" && (
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost px-2 sm:px-3"
                            >
                                <ClipboardList size={20} />
                                <span className="hidden md:block text-[14px]">
                                    My Tasks
                                </span>
                            </div>
                            <ul
                                tabIndex={-1}
                                className="dropdown-content menu bg-base-100 rounded-box z-1 w-46 p-2 shadow-sm border border-wg-outline-variant/70 mt-2"
                            >
                                <li>
                                    <Link to="/admin/incident-reports">
                                        <AlertTriangle size={18} />
                                        <span>Incident reports</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/location-reports">
                                        <MapPinPlus size={18} />
                                        <span>Location reports</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}

                    {isAuthenticated ? (
                        <Link to="/user" className="btn btn-ghost px-2 sm:px-3">
                            <User size={20} />
                            <span className="hidden sm:block text-[14px]">
                                Account
                            </span>
                        </Link>
                    ) : (
                        <Link
                            to="/auth/login"
                            className="btn btn-ghost px-2 sm:px-3"
                        >
                            <LogIn size={20} />
                            <span className="hidden sm:block text-[14px]">
                                Login
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
