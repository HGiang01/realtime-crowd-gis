import React, { useState, useCallback, useMemo } from "react";
import {
    TrafficCone,
    Road,
    Leaf,
    Volume2,
    ShieldAlert,
    HandHeart,
    Landmark,
    AlertTriangle,
    ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Header, CreatePointMap } from "@/component";
import { useIncidentReportStore } from "@/store";
import type { Report } from "@/type";
import ImageUploader, {
    type ImageItem,
} from "../../../component/ImageUploader.tsx";

const CATEGORY_OPTIONS: {
    value: Report.IncidentCategory;
    label: string;
    icon: React.ReactNode;
}[] = [
    {
        value: "infrastructure",
        label: "Infrastructure",
        icon: <TrafficCone className="h-4 w-4" />,
    },
    { value: "traffic", label: "Traffic", icon: <Road className="h-4 w-4" /> },
    {
        value: "environment",
        label: "Environment",
        icon: <Leaf className="h-4 w-4" />,
    },
    { value: "noise", label: "Noise", icon: <Volume2 className="h-4 w-4" /> },
    {
        value: "security",
        label: "Security",
        icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
        value: "healthy_safety",
        label: "Health & Safety",
        icon: <HandHeart className="h-4 w-4" />,
    },
    {
        value: "administrative",
        label: "Administrative",
        icon: <Landmark className="h-4 w-4" />,
    },
    {
        value: "other",
        label: "Other",
        icon: <AlertTriangle className="h-4 w-4" />,
    },
];

const LEVEL_OPTIONS: {
    value: Report.IncidentLevel;
    label: string;
}[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

export default function UserIncidentCreate() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [selectedLevel, setSelectedLevel] =
        useState<Report.IncidentLevel>("low");
    const [selectedCategory, setSelectedCategory] =
        useState<Report.IncidentCategory>("other");

    const [coordinates, setCoordinates] = useState<{
        lng: number;
        lat: number;
    } | null>(null);

    const navigate = useNavigate();
    const { createReport, isLoading, error } = useIncidentReportStore();

    const handleMapClick = useCallback(
        ({ lng, lat }: { lng: number; lat: number }) => {
            setCoordinates({ lng, lat });
        },
        [],
    );

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        images.forEach((image) => {
            formData.append("files", image.file);
        });

        if (coordinates) {
            formData.append("latitude", coordinates.lat.toString());
            formData.append("longitude", coordinates.lng.toString());
        }

        const isSuccess = await createReport(formData);
        if (isSuccess) {
            navigate("/my-reports/incidents");
        }
    };

    const mapComponent = useMemo(
        () => (
            <CreatePointMap
                onLocationSelect={(lng, lat) => handleMapClick({ lng, lat })}
            />
        ),
        [handleMapClick],
    );

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

            <main className="flex-1 flex flex-col z-10 max-w-7xl w-full mx-auto min-h-full p-4 md:p-8">
                <section
                    style={{ animationDelay: "240ms" }}
                    className="mb-4 lg:mb-0"
                >
                    <h1 className="fade-up text-2xl md:text-3xl font-bold">
                        Create Incident Report
                    </h1>
                </section>

                <section
                    className="flex-1 fade-up flex flex-col lg:flex-row gap-6 lg:gap-8 lg:min-h-0 pb-8 lg:pb-0"
                    style={{ animationDelay: "360ms" }}
                >
                    <div className="flex-1 flex flex-col gap-6 lg:gap-4 lg:min-h-0">
                        {/* MAP SECTION */}
                        <div className="flex flex-col lg:flex-1 lg:min-h-0">
                            <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 font-semibold">
                                Geom Point
                                <span className="text-red-400 ml-1">*</span>
                            </h2>

                            <div className="h-[250px] md:h-[300px] lg:h-auto lg:flex-1 w-full relative flex flex-col rounded-xl overflow-hidden border border-wg-outline-variant shadow-sm">
                                {mapComponent}
                            </div>

                            <p className="text-xs md:text-sm text-on-wg-background/60 mt-2 break-words">
                                {coordinates
                                    ? `Longitude: ${coordinates.lng.toFixed(6)}, Latitude: ${coordinates.lat.toFixed(6)}`
                                    : "Click on map to set coordinates!"}
                            </p>
                        </div>

                        {/* IMAGE UPLOADER COMPONENT */}
                        <div className="flex flex-col lg:flex-1 lg:min-h-0 mt-2 lg:mt-0">
                            <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 font-semibold">
                                Incident Image
                                <span className="text-red-400 ml-1">*</span>
                            </h2>
                            <ImageUploader
                                images={images}
                                setImages={setImages}
                            />
                        </div>
                    </div>

                    {/* INCIDENT INFORMATION FORM */}
                    <div
                        className="flex-1 flex flex-col lg:min-h-0 mt-6 lg:mt-0"
                        style={{ animationDelay: "480ms" }}
                    >
                        <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 shrink-0 font-semibold">
                            Incident Information
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 lg:overflow-y-auto space-y-4 lg:space-y-2 flex flex-col justify-between rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-4 md:p-6 lg:min-h-0 shadow-sm"
                        >
                            {/* CATEGORY SELECTOR */}
                            <div className="block text-xs md:text-sm font-medium text-on-wg-surface mt-2 lg:mt-4">
                                Category
                                <span className="text-red-400 ml-1">*</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {CATEGORY_OPTIONS.map(
                                        ({ value, label, icon }) => {
                                            const isSelected =
                                                selectedCategory === value;

                                            return (
                                                <label
                                                    key={value}
                                                    className={`
                                                    cursor-pointer flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs md:text-sm transition-all
                                                    ${
                                                        isSelected
                                                            ? "border-wg-primary bg-wg-primary text-white shadow-sm"
                                                            : "border-wg-outline text-on-wg-surface hover:bg-wg-surface-container hover:border-wg-outline-variant"
                                                    }
                                                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                                                `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        value={value}
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            setSelectedCategory(
                                                                value,
                                                            )
                                                        }
                                                        className="hidden"
                                                        disabled={isLoading}
                                                    />
                                                    {icon}
                                                    <span className="font-medium whitespace-nowrap">
                                                        {label}
                                                    </span>
                                                </label>
                                            );
                                        },
                                    )}
                                </div>
                            </div>

                            {/* LEVEL SELECTOR */}
                            <div className="block text-xs md:text-sm font-medium text-on-wg-surface mt-4">
                                Level
                                <span className="text-red-400 ml-1">*</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {LEVEL_OPTIONS.map(({ value, label }) => {
                                        const isSelected =
                                            selectedLevel === value;

                                        return (
                                            <label
                                                key={value}
                                                className={`
                                                    cursor-pointer flex items-center justify-center gap-1.5 rounded-lg border px-4 py-1.5 text-xs md:text-sm transition-all
                                                    ${
                                                        isSelected
                                                            ? "border-wg-primary bg-wg-primary text-white shadow-sm"
                                                            : "border-wg-outline text-on-wg-surface hover:bg-wg-surface-container hover:border-wg-outline-variant"
                                                    }
                                                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    name="level"
                                                    value={value}
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        setSelectedLevel(value)
                                                    }
                                                    className="hidden"
                                                    disabled={isLoading}
                                                />
                                                <span className="font-medium whitespace-nowrap">
                                                    {label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* DESCRIPTION INPUT */}
                            <label className="flex flex-col flex-1 text-xs md:text-sm font-medium text-on-wg-surface my-4">
                                <div>
                                    Description
                                    <span className="text-red-400 ml-1">*</span>
                                </div>
                                <textarea
                                    className="mt-2 flex-1 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary resize-none min-h-[120px] lg:min-h-[100px]"
                                    placeholder="Briefly describe the incident or issue here..."
                                    name="description"
                                    disabled={isLoading}
                                />
                            </label>

                            {/* ERROR MESSAGE */}
                            {error && (
                                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 mb-2">
                                    {error}
                                </div>
                            )}

                            {/* SUBMIT BUTTON */}
                            <div className="pt-2 mt-auto flex flex-col gap-4">
                                <button
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl btn-primary-solid py-3 md:py-3.5 shadow-md"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        "Creating..."
                                    ) : (
                                        <>
                                            Create
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                                <Link
                                    to="/my-reports/incidents"
                                    className="text-xs text-center font-semibold hover:text-wg-primary hover:underline cursor-pointer transition-all pb-2 lg:pb-0"
                                >
                                    Back to Reports
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}
