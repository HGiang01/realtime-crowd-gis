import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore, useLocationReportAdminStore } from "@/store";
import { Header, Map } from "@/component";
import { ImageViewer } from "../../../component/ImageViewer.tsx";
import { formatTitleCase, formatDateToLocaleVI } from "@/util";

export default function AdminLocationReview() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const {
        isLoading,
        error,
        revisions,
        currentReport,
        fetchAdminReportById,
        fetchAdminLocationRevisions,
        assignReport,
        approveReport,
        rejectReport,
    } = useLocationReportAdminStore();
    const navigate = useNavigate();

    const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(
        null,
    );

    const canClaim = currentReport?.status === "pending_review";
    const canApproveReject =
        currentReport?.status === "processing" &&
        currentReport?.resolverId === user?.id;

    const selectedRevision =
        selectedRevisionId && revisions
            ? revisions.find((rev: any) => rev.id === selectedRevisionId) ||
              revisions[0]
            : revisions && revisions.length > 0
              ? revisions[0]
              : null;

    const handleAssignReport = async () => {
        if (!id) return;
        const success = await assignReport(id);
        if (success) {
            navigate(`/admin/location-reports/pending`);
        }
    };

    const handleApproveReport = async () => {
        if (!id) return;
        const success = await approveReport(id);
        if (success) {
            navigate(`/admin/location-reports/pending`);
        }
    };

    const handleRejectReport = async () => {
        if (!id) return;
        const success = await rejectReport(id);
        if (success) {
            navigate(`/admin/location-reports/pending`);
        }
    };

    useEffect(() => {
        if (!id) return;

        (async () => {
            await fetchAdminReportById(id);
            await fetchAdminLocationRevisions(id);
        })();
    }, [id, fetchAdminReportById, fetchAdminLocationRevisions]);

    return (
        <div className="flex flex-col relative min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden bg-wg-background text-on-wg-background">
            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl" />

            <Header />

            <main className="flex-1 flex flex-col z-10 max-w-7xl w-full mx-auto min-h-full lg:min-h-0 p-4 md:p-8">
                <section style={{ animationDelay: "240ms" }} className="mb-4">
                    <h1 className="fade-up text-2xl md:text-3xl font-bold">
                        Location Report Review
                    </h1>
                    <p className="text-sm text-on-wg-background/60 mb-2">{`#${id}`}</p>
                </section>

                {isLoading && (
                    <div className="flex-1 flex flex-col justify-center items-center py-20">
                        <span className="loading loading-spinner loading-xl"></span>
                        <p className="mt-2">Loading....</p>
                    </div>
                )}

                {currentReport && (
                    <section className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-8 lg:min-h-0 pb-8 lg:pb-0">
                        <div className="flex-1 flex flex-col lg:min-h-0">
                            <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 shrink-0">
                                New Location Report
                            </h2>
                            <div className="lg:overflow-y-auto flex-1 rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-4 md:p-6 shadow-sm">
                                <div className="flex flex-col gap-6 mt-3 lg:pr-2">
                                    {/* MAP */}
                                    <div className="flex flex-col shrink-0">
                                        <h3 className="text-sm font-semibold mb-2 text-on-wg-surface/70">
                                            Geom Point
                                        </h3>
                                        <Map
                                            className="h-48 md:h-64 w-full rounded-xl border border-wg-outline-variant"
                                            externalCoordinate={{
                                                lng: currentReport.longitude,
                                                lat: currentReport.latitude,
                                            }}
                                            mode="none"
                                        />
                                        <p className="text-xs md:text-sm text-on-wg-background/60 mt-2 break-all">
                                            {`Longitude: ${currentReport.longitude.toFixed(6)}, Latitude: ${currentReport.latitude.toFixed(6)}`}
                                        </p>
                                    </div>

                                    {/* IMAGES */}
                                    <div className="flex flex-col shrink-0">
                                        <h3 className="text-sm font-semibold mb-2 text-on-wg-surface/70">
                                            Location Image
                                        </h3>
                                        <ImageViewer
                                            images={currentReport.imageUrls.map(
                                                // FIXED 4: Thêm type ": string" tránh lỗi implicit any
                                                (imageUrl: string) =>
                                                    `${import.meta.env.VITE_FILE_PUBLIC_URL_PREFIX}/${imageUrl}`,
                                            )}
                                        />
                                    </div>

                                    {/* LOCATION DETAILS */}
                                    <div className="flex flex-col shrink-0">
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    label: "Name",
                                                    value: currentReport.name,
                                                },
                                                {
                                                    label: "Address",
                                                    value: currentReport.formattedAddress,
                                                },
                                                {
                                                    label: "Category",
                                                    value: formatTitleCase(
                                                        currentReport.category,
                                                    ),
                                                },
                                                {
                                                    label: "Phone Number",
                                                    value: currentReport.phone,
                                                },
                                                {
                                                    label: "Website / Fanpage",
                                                    value: currentReport.website,
                                                    isLink: true,
                                                },
                                                {
                                                    label: "Operating Hours",
                                                    value: currentReport.operatingHours,
                                                },
                                                {
                                                    label: "Google Maps URL",
                                                    value: currentReport.googleMapsUrl,
                                                    isLink: true,
                                                },
                                                {
                                                    label: "Created At",
                                                    value: currentReport.createdAt
                                                        ? new Date(
                                                              currentReport.createdAt,
                                                          ).toLocaleString(
                                                              "vi-VN",
                                                          )
                                                        : null,
                                                },
                                            ]
                                                .filter(
                                                    (item) =>
                                                        item.value &&
                                                        item.value !== "",
                                                )
                                                .map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="border-b border-wg-outline-variant/30 pb-3 last:border-none last:pb-0"
                                                    >
                                                        <span className="block text-xs font-medium text-on-wg-surface/50">
                                                            {item.label}
                                                        </span>
                                                        {item.isLink ? (
                                                            <a
                                                                href={
                                                                    item.value
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-1 block text-sm text-wg-primary font-medium hover:underline break-all"
                                                            >
                                                                {item.value}
                                                            </a>
                                                        ) : (
                                                            <p className="mt-1 text-sm text-on-wg-surface font-medium">
                                                                {item.value}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="flex-1 flex flex-col lg:min-h-0 mt-6 lg:mt-0"
                            style={{ animationDelay: "480ms" }}
                        >
                            <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 shrink-0">
                                Location Revisions
                            </h2>

                            {currentReport.status === "pending_review" ||
                            currentReport.resolverId === user?.id ? (
                                <div className="flex-1 flex flex-col rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-4 md:p-6 lg:min-h-0 shadow-sm">
                                    <div className="dropdown w-full shrink-0 mb-4 relative">
                                        <div
                                            tabIndex={0}
                                            role="button"
                                            className="btn btn-outline border-wg-outline-variant/70 w-full flex justify-between flex-nowrap bg-base-100 hover:bg-base-200 min-h-[3rem] h-auto py-2"
                                        >
                                            <span className="text-xs md:text-sm font-semibold text-left wrap-break-word overflow-hidden line-clamp-2 pr-2">
                                                {revisions &&
                                                revisions.length > 0
                                                    ? selectedRevision
                                                        ? `${selectedRevision.id.substring(0, 12)}... - ${formatDateToLocaleVI(selectedRevision.createdAt)}`
                                                        : "Select a revision..."
                                                    : "No previous revisions available (Create new location request)"}
                                            </span>
                                            <span className="text-xs opacity-60 shrink-0">
                                                ▼
                                            </span>
                                        </div>
                                        {revisions && revisions.length > 0 && (
                                            <ul
                                                tabIndex={0}
                                                className="dropdown-content menu bg-base-100 rounded-box z-20 w-full p-2 shadow-lg border border-wg-outline-variant/70 mt-1 max-h-60 overflow-y-auto absolute left-0"
                                            >
                                                {revisions.map((rev: any) => (
                                                    <li key={rev.id}>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRevisionId(
                                                                    rev.id,
                                                                );
                                                                (
                                                                    document.activeElement as HTMLElement
                                                                )?.blur();
                                                            }}
                                                            className={`flex flex-col sm:flex-row sm:justify-between items-start sm:items-center w-full py-2 ${
                                                                selectedRevision?.id ===
                                                                rev.id
                                                                    ? "bg-wg-primary/10 text-wg-primary font-bold"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span className="truncate mr-2 text-xs md:text-[13px] font-mono">
                                                                {rev.id.substring(
                                                                    0,
                                                                    12,
                                                                )}
                                                                ...
                                                            </span>
                                                            <span className="text-[10px] md:text-xs opacity-70 whitespace-nowrap mt-1 sm:mt-0">
                                                                {formatDateToLocaleVI(
                                                                    rev.createdAt,
                                                                )}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 mb-6">
                                        {selectedRevision ? (
                                            <>
                                                {/* MAP */}
                                                <div className="flex flex-col shrink-0">
                                                    <h3 className="text-sm font-semibold mb-2 text-on-wg-surface/70">
                                                        Geom Point
                                                    </h3>
                                                    <Map
                                                        className="h-48 md:h-50 w-full rounded-xl border border-wg-outline-variant"
                                                        externalCoordinate={{
                                                            lng: selectedRevision.longitude,
                                                            lat: selectedRevision.latitude,
                                                        }}
                                                        mode="none"
                                                    />

                                                    <p className="text-xs md:text-sm text-on-wg-background/60 mt-2 break-all">
                                                        {`Longitude: ${selectedRevision.longitude.toFixed(6)}, Latitude: ${selectedRevision.latitude.toFixed(6)}`}
                                                    </p>
                                                </div>

                                                {/* IMAGES */}
                                                <div className="flex flex-col shrink-0">
                                                    <h3 className="text-sm font-semibold mb-2 text-on-wg-surface/70">
                                                        Images
                                                    </h3>
                                                    <ImageViewer
                                                        images={selectedRevision.imageUrls.map(
                                                            (
                                                                imageUrl: string,
                                                            ) =>
                                                                `${import.meta.env.VITE_FILE_PUBLIC_URL_PREFIX}/${imageUrl}`,
                                                        )}
                                                    />
                                                </div>

                                                {/* INFO LIST */}
                                                <div className="space-y-3">
                                                    {[
                                                        {
                                                            label: "Name",
                                                            value: selectedRevision.name,
                                                        },
                                                        {
                                                            label: "Address",
                                                            value: selectedRevision.formattedAddress,
                                                        },
                                                        {
                                                            label: "Category",
                                                            value: formatTitleCase(
                                                                selectedRevision.category,
                                                            ),
                                                        },
                                                        {
                                                            label: "Phone Number",
                                                            value: selectedRevision.phone,
                                                        },
                                                        {
                                                            label: "Website / Fanpage",
                                                            value: selectedRevision.website,
                                                            isLink: true,
                                                        },
                                                        {
                                                            label: "Operating Hours",
                                                            value: selectedRevision.operatingHours,
                                                        },
                                                        {
                                                            label: "Google Maps URL",
                                                            value: selectedRevision.googleMapsUrl,
                                                            isLink: true,
                                                        },
                                                        {
                                                            label: "Created At",
                                                            value: selectedRevision.createdAt
                                                                ? formatDateToLocaleVI(
                                                                      selectedRevision.createdAt,
                                                                  )
                                                                : null,
                                                        },
                                                    ]
                                                        .filter(
                                                            (item) =>
                                                                item.value &&
                                                                item.value !==
                                                                    "",
                                                        )
                                                        .map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="border-b border-wg-outline-variant/30 pb-3 last:border-none last:pb-0"
                                                            >
                                                                <span className="block text-xs font-medium text-on-wg-surface/50">
                                                                    {item.label}
                                                                </span>
                                                                {item.isLink ? (
                                                                    <a
                                                                        href={
                                                                            item.value
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="mt-1 block text-sm text-wg-primary font-medium hover:underline break-all"
                                                                    >
                                                                        {
                                                                            item.value
                                                                        }
                                                                    </a>
                                                                ) : (
                                                                    <p className="mt-1 text-sm text-on-wg-surface font-medium">
                                                                        {
                                                                            item.value
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-60 text-center p-4 min-h-[200px]">
                                                <span className="text-sm italic">
                                                    {revisions &&
                                                    revisions.length > 0
                                                        ? "Please select a revision to view details."
                                                        : "This record is a completely new request, with no previous revision history available for comparison."}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 shrink-0 pt-4 border-t border-wg-outline-variant/50">
                                        <Link
                                            to="/admin/location-reports/pending"
                                            className="btn-neutral-outline text-xs sm:text-sm py-2"
                                        >
                                            Back
                                        </Link>
                                        {canClaim && (
                                            <>
                                                <button
                                                    className="btn-primary-outline text-xs sm:text-sm py-2 px-1 sm:px-4"
                                                    onClick={handleAssignReport}
                                                >
                                                    Claim
                                                </button>
                                                <button
                                                    className="btn-error-outline text-xs sm:text-sm py-2 px-1 sm:px-4"
                                                    onClick={handleRejectReport}
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    className="btn-success-outline text-xs sm:text-sm py-2 px-1 sm:px-4"
                                                    onClick={
                                                        handleApproveReport
                                                    }
                                                >
                                                    Approve
                                                </button>
                                            </>
                                        )}
                                        {canApproveReject && (
                                            <>
                                                <button
                                                    className="btn-error-outline text-xs sm:text-sm py-2 px-1 sm:px-4"
                                                    onClick={handleRejectReport}
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    className="btn-success-outline text-xs sm:text-sm py-2 px-1 sm:px-4"
                                                    onClick={
                                                        handleApproveReport
                                                    }
                                                >
                                                    Approve
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-6 md:p-8 text-center min-h-[300px] shadow-sm mt-4 lg:mt-0">
                                    <div className="mb-4 text-blue-500 opacity-80">
                                        <svg
                                            className="w-12 h-12 md:w-16 md:h-16 mx-auto"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-on-wg-surface mb-2">
                                        Report is currently being processed
                                    </h3>
                                    <p className="text-xs md:text-sm text-on-wg-surface/60 mb-6 max-w-md">
                                        This location report is currently under
                                        review or has already been resolved.
                                        Please select another pending report to
                                        take action.
                                    </p>
                                    <Link
                                        to="/admin/location-reports/pending"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-wg-primary px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-semibold text-white transition hover:bg-wg-primary/90"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Return to Pending Reports
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
