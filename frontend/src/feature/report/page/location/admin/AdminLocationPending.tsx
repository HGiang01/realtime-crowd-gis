import { useEffect, useState, useMemo, useCallback } from "react";
import Header from "@/component/Header.tsx";
import { SearchAlert } from "lucide-react";
import { ReportCard } from "../../../component/ReportCard.tsx";
import { Pagination } from "../../../component/Pagination.tsx";
import { useLocationReportAdminStore } from "@/store";
import {
    type FilterOption,
    ReportFilterBar,
    FilterSelect,
} from "@/component/ReportFilterBar.tsx";

const LOCATION_SORT_OPTIONS: FilterOption[] = [
    { label: "Newest first", value: "created_at,desc" },
    { label: "Oldest first", value: "created_at,asc" },
];

export default function AdminLocationPending() {
    const { isLoading, pendingReports, pagination, fetchPendingReports } =
        useLocationReportAdminStore();

    const [keyword, setKeyword] = useState("");
    const [activeStatus, setActiveStatus] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>(
        LOCATION_SORT_OPTIONS[0].value,
    );
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        fetchPendingReports({
            page: currentPage,
            size: 20,
            keyword: keyword,
            status: activeStatus,
            category: activeCategory,
            sort: sortBy,
        });
    }, [
        currentPage,
        keyword,
        activeStatus,
        activeCategory,
        sortBy,
        fetchPendingReports,
    ]);

    const handleSearchChange = useCallback((val: string) => {
        setKeyword(val);
        setCurrentPage(0);
    }, []);

    const handleSortChange = useCallback((val: string) => {
        setSortBy(val);
        setCurrentPage(0);
    }, []);

    const handleCategoryChange = useCallback((val: string) => {
        setActiveCategory(val);
        setCurrentPage(0);
    }, []);

    const handleResetFilters = useCallback(() => {
        setKeyword("");
        setActiveStatus("");
        setSortBy(LOCATION_SORT_OPTIONS[0].value);
        setCurrentPage(0);
    }, []);

    const renderedReportList = useMemo(() => {
        if (pendingReports.length === 0) return null;

        return (
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 transition-opacity duration-300 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
            >
                {pendingReports.map((report) => (
                    <ReportCard
                        key={report.id}
                        locationData={report}
                        actionLink={`/admin/location-reports/${report.id}/review`}
                    />
                ))}
            </div>
        );
    }, [pendingReports, isLoading]);

    return (
        <div className="flex flex-col relative min-h-screen bg-wg-background text-on-wg-background font-sans">
            <div className="pointer-events-none fixed -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl" />
            <div className="pointer-events-none fixed -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl" />

            <Header />

            <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-3xl font-bold text-on-wg-surface mb-2 tracking-tight">
                        Location Report Pending
                    </h1>
                </div>

                <ReportFilterBar
                    onSearchChange={handleSearchChange}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortOptions={LOCATION_SORT_OPTIONS}
                    onReset={handleResetFilters}
                >
                    <FilterSelect
                        label="Category"
                        value={activeCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All</option>
                        <option value="education">Education</option>
                        <option value="government">Government</option>
                        <option value="landmark">Landmark</option>
                        <option value="market">Market</option>
                        <option value="medical">Medical</option>
                        <option value="museum">Museum</option>
                        <option value="park">Park</option>
                        <option value="police">Police</option>
                        <option value="religion">Religion</option>
                        <option value="restroom">Restroom</option>
                        <option value="tourism">Tourism</option>
                        <option value="other">Other</option>
                    </FilterSelect>
                </ReportFilterBar>

                <div className="relative min-h-100 mt-2">
                    {isLoading && (
                        <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-wg-background/50 backdrop-blur-[2px] rounded-xl transition-all">
                            <span className="loading loading-spinner loading-xl text-wg-primary"></span>
                            <p className="mt-4 text-on-wg-surface-variant font-medium">
                                Updating reports...
                            </p>
                        </div>
                    )}

                    {pendingReports.length > 0 ? (
                        renderedReportList
                    ) : !isLoading ? (
                        <div className="flex-1 py-20 flex flex-col justify-center items-center text-center text-on-wg-surface-variant">
                            <SearchAlert
                                size={48}
                                className="mb-4 opacity-50"
                            />
                            <h2 className="text-xl font-semibold text-on-wg-surface">
                                No reports found
                            </h2>
                            <p className="mt-2 text-sm max-w-sm">
                                {keyword || activeStatus !== ""
                                    ? "We couldn't find any reports matching your current filters."
                                    : "There are no pending location reports to display."}
                            </p>
                        </div>
                    ) : null}
                </div>

                {pendingReports.length > 0 && pagination && (
                    <div
                        className={
                            isLoading ? "opacity-40 pointer-events-none" : ""
                        }
                    >
                        <Pagination
                            number={pagination.number}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
