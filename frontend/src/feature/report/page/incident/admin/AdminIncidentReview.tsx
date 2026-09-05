import { Link, useParams } from "react-router-dom";
import { X, Check, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useIncidentReportAdminStore, useAuthStore } from "@/store";
import { Header, Map } from "@/component";
import { formatTitleCase, formatDateToLocaleVI } from "@/util";
import { ImageViewer } from "../../../component/ImageViewer.tsx";
import ImageUploader, {
    type ImageItem,
} from "../../../component/ImageUploader.tsx";

export default function AdminIncidentReview() {
    const { id } = useParams();
    const { user } = useAuthStore();

    const {
        isLoading,
        isSubmitting: isResultSubmitting,
        error: resultStoreError,
        currentReport,
        currentReportResult,
        assignReport,
        fetchAdminReportById,
        fetchReportResultById,
        createReportResult,
        updateReportResult,
    } = useIncidentReportAdminStore();

    const [images, setImages] = useState<ImageItem[]>([]);
    const [submitResultError, setSubmitResultError] = useState("");

    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAdminReportById(id);
            fetchReportResultById(id);
        }
    }, [id, fetchAdminReportById, fetchReportResultById]);

    const hasResult = !!(
        currentReportResult?.description ||
        (currentReportResult?.imageUrls &&
            currentReportResult.imageUrls.length > 0)
    );

    const hasRating = !!(
        currentReportResult?.satisfactionRating &&
        currentReportResult.satisfactionRating !== "pending_rating"
    );

    const handleResultSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitResultError("");

        const formData = new FormData(e.currentTarget);
        const submitter = (e.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;

        if (submitter?.value) formData.append("status", submitter.value);

        images.forEach((image) => {
            if (image.file) formData.append("files", image.file);
        });

        if (!id) return;

        try {
            const isSuccess = hasResult
                ? await updateReportResult(id, formData)
                : await createReportResult(id, formData);

            if (isSuccess) {
                window.location.reload();
            } else {
                setSubmitResultError(
                    `Failed to ${hasResult ? "update" : "create"} result. Please try again!`,
                );
            }
        } catch (err) {
            setSubmitResultError("An error occurred while submitting!");
        }
    };

    const handleClaim = async () => {
        if (!id) return;
        setIsClaiming(true);
        try {
            await assignReport(id);
            await fetchAdminReportById(id);
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="flex flex-col relative min-h-screen overflow-y-auto lg:overflow-hidden bg-wg-background text-on-wg-background">
            <style>{`
                @keyframes fade-up { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
                .fade-up { animation: fade-up 600ms ease-out both; }
            `}</style>

            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl hidden lg:block" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl hidden lg:block" />

            <Header />

            <main className="flex-1 flex flex-col z-10 w-full max-w-400 mx-auto min-h-full p-4 md:p-8">
                <section
                    style={{ animationDelay: "240ms" }}
                    className="mb-4 lg:mb-0"
                >
                    <div className="flex items-center gap-4">
                        <h1 className="fade-up text-2xl md:text-3xl font-bold">
                            Incident Report Detail
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm text-on-wg-background/60 mt-1 mb-2 break-all">{`#${id}`}</p>
                </section>

                {isLoading && (
                    <div className="flex-1 flex flex-col justify-center items-center py-20 lg:py-0">
                        <span className="loading loading-spinner loading-xl"></span>
                        <p className="mt-2">Loading....</p>
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
                                    className="min-h-62.5 lg:flex-1 lg:min-h-0 rounded-xl border border-wg-outline-variant cursor-pointer"
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
                                    Incident Image
                                </h2>
                                <ImageViewer
                                    images={currentReport.imageUrls.map(
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (url: any) =>
                                            `${import.meta.env.VITE_FILE_PUBLIC_URL_PREFIX}/${url}`,
                                    )}
                                />
                            </div>
                        </div>

                        <div
                            className="flex-1 flex flex-col lg:min-h-0 mt-6 lg:mt-0"
                            style={{ animationDelay: "480ms" }}
                        >
                            <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 shrink-0 font-semibold">
                                Incident Information
                            </h2>
                            <div className="flex-6 flex flex-col rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-4 md:p-6 lg:min-h-0 shadow-sm">
                                <div className="flex items-center justify-between border-b border-wg-outline-variant/50 pb-4 mb-4 shrink-0">
                                    <span className="text-xs md:text-sm font-semibold text-on-wg-surface/70">
                                        Report Status
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full border ${
                                            currentReport.status ===
                                            "processing"
                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                : currentReport.status ===
                                                    "approved"
                                                  ? "bg-green-50 text-green-600 border-green-200"
                                                  : currentReport.status ===
                                                      "rejected"
                                                    ? "bg-red-50 text-red-600 border-red-200"
                                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                        }`}
                                    >
                                        {formatTitleCase(currentReport.status)}
                                    </span>
                                </div>

                                <div className="space-y-4 lg:flex-1 lg:overflow-y-auto pr-1 mb-4">
                                    {[
                                        {
                                            label: "Category",
                                            value: formatTitleCase(
                                                currentReport.category,
                                            ),
                                        },
                                        {
                                            label: "Level",
                                            value: formatTitleCase(
                                                currentReport.level,
                                            ),
                                        },
                                        {
                                            label: "Description",
                                            value: currentReport.description,
                                        },
                                        {
                                            label: "Created At",
                                            value: currentReport.createdAt
                                                ? formatDateToLocaleVI(
                                                      currentReport.createdAt,
                                                  )
                                                : null,
                                        },
                                        {
                                            label: "Resolver ID",
                                            value:
                                                currentReport.resolverId ||
                                                "N/A",
                                        },
                                    ]
                                        .filter((item) => item.value)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className="border-b border-wg-outline-variant/30 pb-3 last:border-none"
                                            >
                                                <span className="block text-xs font-medium text-on-wg-surface/50">
                                                    {item.label}
                                                </span>
                                                <p className="mt-1 text-sm text-on-wg-surface font-medium whitespace-pre-wrap break-words">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="flex-4 flex flex-col lg:min-h-0 mt-6 md:mt-4">
                                <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 shrink-0 font-semibold">
                                    Incident Result Rating
                                </h2>
                                <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-6 lg:min-h-0 shadow-sm min-h-[150px]">
                                    {hasRating ? (
                                        <>
                                            <div className="rating rating-md md:rating-xl flex items-center justify-center gap-2 md:gap-4">
                                                {[
                                                    "dissatisfied",
                                                    "acceptable",
                                                    "satisfied",
                                                ].map((val, idx) => (
                                                    <input
                                                        key={idx}
                                                        type="radio"
                                                        className="mask mask-star-2 bg-orange-400"
                                                        checked={
                                                            currentReportResult?.satisfactionRating ===
                                                            val
                                                        }
                                                        readOnly
                                                    />
                                                ))}
                                            </div>
                                            <div className="mt-4 lg:overflow-y-auto lg:max-h-24 text-center text-sm">
                                                {currentReportResult?.satisfactionComment ||
                                                    "No comment provided."}
                                            </div>
                                            {currentReportResult?.ratedAt && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-medium text-on-wg-surface/50">
                                                        Rated at:{" "}
                                                        {formatDateToLocaleVI(
                                                            currentReportResult.ratedAt,
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm font-medium text-on-wg-surface/50 italic text-center">
                                            Waiting for user's feedback...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className="flex-1 flex flex-col lg:min-h-0 mt-6 lg:mt-0"
                            style={{ animationDelay: "480ms" }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg md:text-xl text-on-wg-background/80 shrink-0 font-semibold">
                                    Incident Result
                                </h2>
                                <Link
                                    to="/admin/incident-reports"
                                    className="text-xs font-semibold text-wg-primary hover:underline transition-all"
                                >
                                    Back to Reports
                                </Link>
                            </div>

                            <div className="relative flex-1 flex flex-col rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-4 md:p-6 lg:min-h-0 shadow-sm min-h-[300px]">
                                {hasResult ? (
                                    <div className="w-full h-full flex flex-col gap-6 lg:overflow-y-auto lg:pr-2">
                                        {/* Edit button just for the resolver */}
                                        {currentReport.resolverId ===
                                            user?.id && (
                                            <button
                                                type="button"
                                                className="absolute top-3 right-3 rounded-2xl py-2 px-3 md:py-3 md:px-4 btn-primary-solid hover:bg-wg-primary/90 transition-all text-white cursor-pointer z-10 shadow-md"
                                                onClick={() =>
                                                    (
                                                        document.getElementById(
                                                            "result_modal",
                                                        ) as HTMLDialogElement
                                                    )?.showModal()
                                                }
                                            >
                                                <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                                            </button>
                                        )}

                                        {currentReportResult.description && (
                                            <div className="mt-2 pr-12">
                                                <h3 className="block text-xs font-semibold text-on-wg-surface/70 mb-1">
                                                    Description
                                                </h3>
                                                <p className="text-sm text-on-wg-surface whitespace-pre-wrap break-words">
                                                    {
                                                        currentReportResult.description
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {currentReportResult.imageUrls &&
                                            currentReportResult.imageUrls
                                                .length > 0 && (
                                                <div>
                                                    <h3 className="block text-xs font-semibold text-on-wg-surface/70 mb-2">
                                                        Attached Images
                                                    </h3>
                                                    <ImageViewer
                                                        images={currentReportResult.imageUrls.map(
                                                            (url: string) =>
                                                                `${import.meta.env.VITE_FILE_PUBLIC_URL_PREFIX}/${url}`,
                                                        )}
                                                    />
                                                </div>
                                            )}

                                        {currentReportResult.updatedAt && (
                                            <div className="mt-auto pt-4 border-t border-wg-outline-variant/30">
                                                <p className="text-xs font-medium text-on-wg-surface/50">
                                                    Last updated:{" "}
                                                    {formatDateToLocaleVI(
                                                        currentReportResult.updatedAt,
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center w-full h-full">
                                        {currentReport.resolverId ===
                                        user?.id ? (
                                            <button
                                                type="button"
                                                className="inline-flex px-6 items-center justify-center gap-2 rounded-2xl py-3 btn-primary-solid text-white text-sm font-medium hover:bg-wg-primary/90 transition-all shadow-md"
                                                onClick={() =>
                                                    (
                                                        document.getElementById(
                                                            "result_modal",
                                                        ) as HTMLDialogElement
                                                    )?.showModal()
                                                }
                                            >
                                                Create Result{" "}
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleClaim}
                                                disabled={isClaiming}
                                                className="inline-flex px-6 items-center justify-center gap-2 rounded-2xl py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md"
                                            >
                                                {isClaiming
                                                    ? "Claiming..."
                                                    : "Claim Report"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                <dialog id="result_modal" className="modal">
                    <div className="modal-box w-11/12 max-w-2xl bg-wg-surface-container-lowest">
                        <h3 className="font-bold text-lg md:text-xl mb-4 text-on-wg-surface">
                            {hasResult
                                ? "Update Incident Result"
                                : "Create Incident Result"}
                        </h3>
                        <form
                            id="result_form"
                            onSubmit={handleResultSubmit}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-on-wg-surface/80">
                                    Description{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full resize-none min-h-[120px] bg-white"
                                    placeholder="Briefly describe the incident or issue here..."
                                    name="description"
                                    disabled={isResultSubmitting}
                                    defaultValue={
                                        currentReportResult?.description
                                    }
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-on-wg-surface/80">
                                    Images{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <ImageUploader
                                    images={images}
                                    setImages={setImages}
                                />
                            </div>

                            {(submitResultError || resultStoreError) && (
                                <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                                    {submitResultError || resultStoreError}
                                </p>
                            )}
                        </form>

                        <div className="modal-action flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 gap-4 sm:gap-0">
                            <form
                                method="dialog"
                                className="w-full sm:w-auto order-2 sm:order-1"
                            >
                                <button
                                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl py-3 px-6 text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                    disabled={isResultSubmitting}
                                >
                                    Cancel
                                </button>
                            </form>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                                <button
                                    form="result_form"
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                                    type="submit"
                                    name="action"
                                    value="rejected"
                                    disabled={isResultSubmitting}
                                >
                                    {isResultSubmitting
                                        ? "Processing..."
                                        : "Reject"}{" "}
                                    <X className="h-4 w-4" />
                                </button>
                                <button
                                    form="result_form"
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                    type="submit"
                                    name="action"
                                    value="approved"
                                    disabled={isResultSubmitting}
                                >
                                    {isResultSubmitting
                                        ? "Processing..."
                                        : "Approve"}{" "}
                                    <Check className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            </main>
        </div>
    );
}
