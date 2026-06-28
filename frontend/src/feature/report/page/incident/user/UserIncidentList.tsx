import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/component/Header.tsx";
import { Plus, SearchAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { ReportCard } from "../../../component/ReportCard.tsx";
import { Pagination } from "../../../component/Pagination.tsx";
import { useIncidentReportStore } from "@/store";
import {
    type FilterOption,
    ReportFilterBar,
    FilterSelect,
} from "@/component/ReportFilterBar.tsx";

const INCIDENT_SORT_OPTIONS: FilterOption[] = [
    { label: "Newest first", value: "created_at,desc" },
    { label: "Oldest first", value: "created_at,asc" },
];

const createLink = "/incident-reports/create";

export default function UserIncidentList() {
    const { isLoading, reports, pagination, fetchUserReports } =
        useIncidentReportStore();

    const [keyword, setKeyword] = useState("");
    const [activeStatus, setActiveStatus] = useState<string>("");
    const [activeLevel, setActiveLevel] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>(
        INCIDENT_SORT_OPTIONS[0].value,
    );
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        fetchUserReports({
            page: currentPage,
            size: 20,
            sort: sortBy,
            keyword: keyword,
            status: activeStatus,
            level: activeLevel,
            category: activeCategory,
        });
    }, [
        currentPage,
        keyword,
        activeStatus,
        activeLevel,
        activeCategory,
        sortBy,
        fetchUserReports,
    ]);

    const handleSearchChange = useCallback((val: string) => {
        setKeyword(val);
        setCurrentPage(0);
    }, []);

    const handleSortChange = useCallback((val: string) => {
        setSortBy(val);
        setCurrentPage(0);
    }, []);

    const handleStatusChange = useCallback((val: string) => {
        setActiveStatus(val);
        setCurrentPage(0);
    }, []);

    const handleLevelChange = useCallback((val: string) => {
        setActiveLevel(val);
        setCurrentPage(0);
    }, []);

    const handleCategoryChange = useCallback((val: string) => {
        setActiveCategory(val);
        setCurrentPage(0);
    }, []);

    const handleResetFilters = useCallback(() => {
        setKeyword("");
        setActiveStatus("");
        setActiveLevel("");
        setActiveCategory("");
        setSortBy(INCIDENT_SORT_OPTIONS[0].value);
        setCurrentPage(0);
    }, []);

    const renderedReportList = useMemo(() => {
        if (reports.length === 0) return null;

        return (
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 transition-opacity duration-300 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
            >
                {reports.map((report) => (
                    <ReportCard
                        key={report.id}
                        incidentData={report}
                        actionLink={`/incident-reports/${report.id}`}
                    />
                ))}
            </div>
        );
    }, [reports, isLoading]);

    return (
        <div className="flex flex-col relative min-h-screen bg-wg-background text-on-wg-background font-sans">
            <div className="pointer-events-none fixed -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl" />
            <div className="pointer-events-none fixed -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl" />

            <Header />

            <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-3xl font-bold text-on-wg-surface mb-2 tracking-tight">
                        My incident reports history
                    </h1>
                    <button>
                        <Link to={createLink} className="btn-primary-solid">
                            <Plus size={18} />
                            Create new
                        </Link>
                    </button>
                </div>

                <ReportFilterBar
                    onSearchChange={handleSearchChange}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortOptions={INCIDENT_SORT_OPTIONS}
                    onReset={handleResetFilters}
                >
                    <FilterSelect
                        label="Category"
                        value={activeCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="traffic">Traffic</option>
                        <option value="environment">Environment</option>
                        <option value="noise">Noise</option>
                        <option value="security">Security</option>
                        <option value="healthy_safety">Healthy Safety</option>
                        <option value="administrative">Administrative</option>
                        <option value="other">Other</option>
                    </FilterSelect>

                    <FilterSelect
                        label="Level"
                        value={activeLevel}
                        onChange={handleLevelChange}
                    >
                        <option value="">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </FilterSelect>

                    <FilterSelect
                        label="Status"
                        value={activeStatus}
                        onChange={handleStatusChange}
                    >
                        <option value="">All</option>
                        <option value="pending_review">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </FilterSelect>
                </ReportFilterBar>

                <div className="relative min-h-100 mt-2">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <span className="loading loading-spinner loading-xl"></span>
                            <p className="mt-2">Loading....</p>
                        </div>
                    ) : reports.length > 0 ? (
                        renderedReportList
                    ) : (
                        <div className="flex-1 py-20 flex flex-col justify-center items-center text-center text-on-wg-surface-variant">
                            <SearchAlert size={40} />
                            <h2 className="mt-2 text-2xl">Reports not found</h2>
                            <p className="text-sm">
                                You haven't submitted any reports yet. <br />
                                Create your first report to get started.
                            </p>
                            <Link
                                to={createLink}
                                className="mt-4 btn-primary-solid"
                            >
                                Create incident report
                            </Link>
                        </div>
                    )}
                </div>

                {reports.length > 0 && (
                    <Pagination
                        number={pagination!.number}
                        totalPages={pagination!.totalPages}
                    />
                )}
            </main>
        </div>
    );
}
