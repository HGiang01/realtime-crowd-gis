import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocationReportStore } from "@/store";
import { Header, Map } from "@/component";
import { ImageViewer } from "../../../component/ImageViewer.tsx";
import { formatTitleCase } from "@/util";

export default function UserLocationDetail() {
    const { id } = useParams();
    const { isLoading, error, currentReport, fetchUserReportById } =
        useLocationReportStore();

    useEffect(() => {
        if (!id) return;

        (async () => {
            await fetchUserReportById(id);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    return (
        <div className="flex flex-col relative min-h-screen overflow-y-auto lg:overflow-hidden bg-wg-background text-on-wg-background">
            <style>{`
                @keyframes fade-up {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fade-up 600ms ease-out both; }
            `}</style>

            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl hidden lg:block" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl hidden lg:block" />

            <Header />

            <main className="flex-1 flex flex-col z-10 max-w-300 w-full mx-auto min-h-full p-4 md:p-8">
                <section
                    style={{ animationDelay: "240ms" }}
                    className="mb-4 lg:mb-0"
                >
                    <h1 className="fade-up text-2xl md:text-3xl font-bold">
                        Location Report Detail
                    </h1>
                    <p className="text-xs md:text-sm text-on-wg-background/60 mt-1 mb-2 break-all">{`#${id}`}</p>
                </section>

                {isLoading && (
                    <div className="flex-1 flex flex-col justify-center items-center py-20 lg:py-0">
                        <span className="loading loading-spinner loading-xl"></span>
                        <p className="mt-2">Loading....</p>
                    </div>
                )}

                {error && (
                    <div className="flex-1 flex flex-col justify-center items-center py-20 lg:py-0">
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                )}

                {currentReport && (
                    <section
                        className="flex-1 fade-up flex flex-col lg:flex-row gap-6 lg:gap-8 lg:min-h-0 pb-8 lg:pb-0"
                        style={{ animationDelay: "360ms" }}
                    >
                        <div className="flex-1 flex flex-col gap-6 lg:gap-4 lg:min-h-0">
                            <div className="flex flex-col lg:flex-1 lg:min-h-0">
                                <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 font-semibold">
                                    Geom Point
                                </h2>
                                <Map
                                    className="min-h-62.5 lg:flex-1 lg:min-h-0 rounded-xl border border-wg-outline-variant cursor-pointer shadow-sm"
                                    externalCoordinate={{
                                        lng: currentReport.longitude,
                                        lat: currentReport.latitude,
                                    }}
                                    mode="none"
                                />
                                <p className="text-xs md:text-sm text-on-wg-background/60 mt-2 wrap-break-word">
                                    {`Longitude: ${currentReport.longitude.toFixed(6)}, Latitude: ${currentReport.latitude.toFixed(6)}`}
                                </p>
                            </div>

                            <div className="flex flex-col lg:flex-1 lg:min-h-0 mt-2 lg:mt-0">
                                <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 font-semibold">
                                    Location Image
                                </h2>
                                {currentReport.imageUrls &&
                                currentReport.imageUrls.length > 0 ? (
                                    <ImageViewer
                                        images={currentReport.imageUrls.map(
                                            (imageUrl) =>
                                                `${import.meta.env.VITE_FILE_PUBLIC_URL_PREFIX}/${imageUrl}`,
                                        )}
                                    />
                                ) : (
                                    <div className="flex-1 min-h-37.5 flex items-center justify-center rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest shadow-sm">
                                        <p className="text-sm font-medium text-on-wg-background/50 italic">
                                            No images available
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            className="flex-1 flex flex-col lg:min-h-0 mt-6 lg:mt-0"
                            style={{ animationDelay: "480ms" }}
                        >
                            <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 shrink-0 font-semibold">
                                Location Information
                            </h2>
                            <div className="flex-1 flex flex-col rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-4 md:p-6 lg:min-h-0 shadow-sm">
                                <div className="flex items-center justify-between border-b border-wg-outline-variant/50 pb-4 mb-4 shrink-0">
                                    <span className="text-xs md:text-sm font-semibold text-on-wg-surface/70">
                                        Report Status
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full border ${(() => {
                                            switch (currentReport.status) {
                                                case "processing":
                                                    return "bg-blue-50 text-blue-600 border-blue-200";
                                                case "approved":
                                                    return "bg-green-50 text-green-600 border-green-200";
                                                case "rejected":
                                                    return "bg-red-50 text-red-600 border-red-200";
                                                default:
                                                    return "bg-gray-100 text-gray-600 border-gray-200";
                                            }
                                        })()}`}
                                    >
                                        {formatTitleCase(currentReport.status)}
                                    </span>
                                </div>

                                <div className="space-y-4 lg:flex-1 lg:overflow-y-auto pr-1 mb-6">
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
                                                  ).toLocaleString("vi-VN")
                                                : null,
                                        },
                                    ]
                                        .filter(
                                            (item) =>
                                                item.value && item.value !== "",
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
                                                        href={item.value}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-1 block text-sm text-wg-primary font-medium hover:underline break-all"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="mt-1 text-sm text-on-wg-surface font-medium whitespace-pre-wrap break-words">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                <Link
                                    to="/my-reports/locations"
                                    className="inline-flex w-full shrink-0 mt-auto items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3.5 md:py-3 text-sm font-semibold text-white shadow-md transition hover:bg-wg-primary/90"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Reports
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
