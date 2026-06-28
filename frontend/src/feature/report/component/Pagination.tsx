import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    number: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
}

export const Pagination = React.memo(
    ({ number = 0, totalPages = 1, onPageChange }: PaginationProps) => {
        const currentPage = number + 1;

        const pages = useMemo(() => {
            const maxVisible = 5;

            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end === totalPages) {
                start = Math.max(1, totalPages - maxVisible + 1);
            }

            const pageArray: number[] = [];
            for (let i = start; i <= end; i++) {
                pageArray.push(i);
            }
            return pageArray;
        }, [currentPage, totalPages]);

        if (totalPages <= 0) return null;

        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <button
                    onClick={() => onPageChange?.(number - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-wg-outline-variant text-on-wg-surface-variant hover:bg-wg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange?.(page - 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                                ? "bg-wg-primary text-on-wg-primary"
                                : "border border-wg-outline-variant text-on-wg-surface hover:bg-wg-surface-container"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange?.(number + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-wg-outline-variant text-on-wg-surface-variant hover:bg-wg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        );
    },
);

Pagination.displayName = "Pagination";
