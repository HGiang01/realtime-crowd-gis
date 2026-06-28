import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header, CreatePointMap } from "@/component";
import { useLocationReportStore } from "@/store";
import ImageUploader, {
    type ImageItem,
} from "../../../component/ImageUploader.tsx";
import type { Report } from "@/type";

import { mapApi } from "@/api";

const CATEGORY_OPTIONS: {
    value: Report.LocationCategory;
    label: string;
}[] = [
    { value: "education", label: "Education" },
    { value: "government", label: "Government" },
    { value: "landmark", label: "Landmark" },
    { value: "market", label: "Market" },
    { value: "medical", label: "Medical" },
    { value: "museum", label: "Museum" },
    { value: "park", label: "Park" },
    { value: "police", label: "Police" },
    { value: "religion", label: "Religion" },
    { value: "restroom", label: "Restroom" },
    { value: "tourism", label: "Tourism" },
    { value: "other", label: "Other" },
];

export interface LocationDetail {
    id: string;
    userId: string;
    locationId: string | null;
    name: string;
    formattedAddress: string;
    category: Report.LocationCategory;
    phone: string;
    website: string;
    operatingHours: string;
    googleMapsUrl: string;
    longitude: number;
    latitude: number;
    status: string;
    createdAt: string;
    imageUrls: string[];
}

export default function UserLocationCreate() {
    const { id } = useParams();
    const [images, setImages] = useState<ImageItem[]>([]);
    const [coordinates, setCoordinates] = useState<{
        lng: number;
        lat: number;
    } | null>(null);

    const [initialLocationData, setInitialLocationData] =
        useState<LocationDetail | null>(null);

    // Avoid rendering the map with null coordinates when editing an existing location report
    const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(!!id);

    const navigate = useNavigate();
    const { createReport, updateReport, isLoading, error } =
        useLocationReportStore();

    useEffect(() => {
        if (id) {
            const fetchLocationDetail = async () => {
                setIsFetchingLocation(true);
                try {
                    const response = await mapApi.getLocationDetail(id);
                    const location = response.data.details;

                    setInitialLocationData(location!);

                    if (location!.longitude && location!.latitude) {
                        setCoordinates({
                            lng: location!.longitude,
                            lat: location!.latitude,
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch location detail:", err);
                } finally {
                    setIsFetchingLocation(false);
                }
            };
            fetchLocationDetail();
        }
    }, [id]);

    const handleMapClick = ({ lng, lat }: { lng: number; lat: number }) => {
        setCoordinates({ lng, lat });
    };

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

        if (id) {
            formData.append("locationId", id);
        }

        const isSuccess = await (id
            ? updateReport(formData)
            : createReport(formData));
        if (isSuccess) {
            navigate("/my-reports/locations");
        }
    };

    if (isFetchingLocation) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-wg-background text-on-wg-background">
                Loading location details...
            </div>
        );
    }

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
                        Create Location Report
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
                            <div className="h-75 lg:h-auto lg:flex-1 w-full relative flex flex-col rounded-xl overflow-hidden border border-wg-outline-variant shadow-sm">
                                <CreatePointMap
                                    initialCoordinates={coordinates}
                                    onLocationSelect={(lng, lat) =>
                                        handleMapClick({ lng, lat })
                                    }
                                />
                            </div>
                            <p className="text-xs md:text-sm text-on-wg-background/60 mt-2 wrap-break-word">
                                {coordinates
                                    ? `Longitude: ${coordinates.lng.toFixed(6)}, Latitude: ${coordinates.lat.toFixed(6)}`
                                    : "Click on map to set coordinates!"}
                            </p>
                        </div>

                        {/* IMAGE UPLOADER COMPONENT */}
                        <div className="flex flex-col lg:flex-1 lg:min-h-0 mt-2 lg:mt-0">
                            <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 font-semibold">
                                Location Image
                                <span className="text-red-400 ml-1">*</span>
                            </h2>
                            <ImageUploader
                                images={images}
                                setImages={setImages}
                            />
                        </div>
                    </div>

                    {/* LOCATION INFORMATION FORM */}
                    <div
                        className="flex-1 flex flex-col lg:min-h-0 mt-6 lg:mt-0"
                        style={{ animationDelay: "480ms" }}
                    >
                        <h2 className="text-lg md:text-xl mb-2 text-on-wg-background/80 shrink-0 font-semibold">
                            Location Information
                        </h2>
                        <form
                            key={initialLocationData?.id || "new-form"}
                            onSubmit={handleSubmit}
                            className="flex-1 lg:overflow-y-auto space-y-4 lg:space-y-2 flex flex-col justify-between rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest p-4 md:p-6 lg:min-h-0 shadow-sm"
                        >
                            <label className="block text-xs md:text-sm font-medium text-on-wg-surface/80">
                                Name<span className="text-red-400 ml-1">*</span>
                                <input
                                    className="mt-2 w-full input input-bordered rounded-xl h-10 md:h-12"
                                    placeholder="e.g., Golden Gate Park"
                                    type="text"
                                    name="name"
                                    defaultValue={
                                        initialLocationData?.name || ""
                                    }
                                    disabled={isLoading}
                                />
                            </label>
                            <label className="block text-xs md:text-sm font-medium text-on-wg-surface/80">
                                Address
                                <span className="text-red-400 ml-1">*</span>
                                <input
                                    className="mt-2 w-full input input-bordered rounded-xl h-10 md:h-12"
                                    placeholder="123 Main St, City, Country"
                                    type="text"
                                    name="formattedAddress"
                                    defaultValue={
                                        initialLocationData?.formattedAddress ||
                                        ""
                                    }
                                    disabled={isLoading}
                                />
                            </label>
                            <label className="block text-xs md:text-sm font-medium text-on-wg-surface/80">
                                Category
                                <select
                                    className="mt-2 w-full select select-bordered rounded-xl cursor-pointer h-10 md:h-12 min-h-[2.5rem]"
                                    name="category"
                                    defaultValue={
                                        initialLocationData?.category || ""
                                    }
                                    disabled={isLoading}
                                >
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-400"
                                    >
                                        Select a category...
                                    </option>
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-xs md:text-sm font-medium text-on-wg-surface/80">
                                Phone Number
                                <input
                                    className="mt-2 w-full input input-bordered rounded-xl h-10 md:h-12"
                                    placeholder="0123456789"
                                    type="text"
                                    name="phone"
                                    defaultValue={
                                        initialLocationData?.phone || ""
                                    }
                                    disabled={isLoading}
                                />
                            </label>
                            <label className="block text-xs md:text-sm font-medium text-on-wg-surface/80">
                                Website/Fanpage
                                <input
                                    className="mt-2 w-full input input-bordered rounded-xl h-10 md:h-12"
                                    placeholder="https://www.example.com"
                                    type="text"
                                    name="website"
                                    defaultValue={
                                        initialLocationData?.website || ""
                                    }
                                    disabled={isLoading}
                                />
                            </label>
                            <label className="block text-xs md:text-sm font-medium text-on-wg-surface/80">
                                Operating Hours
                                <input
                                    className="mt-2 w-full input input-bordered rounded-xl h-10 md:h-12"
                                    placeholder="e.g., Monday: 6:00 - 18:00"
                                    type="text"
                                    name="operatingHours"
                                    defaultValue={
                                        initialLocationData?.operatingHours ||
                                        ""
                                    }
                                    disabled={isLoading}
                                />
                            </label>
                            <label className="block text-xs md:text-sm font-medium text-on-wg-surface/80">
                                Google Maps URL
                                <input
                                    className="mt-2 w-full input input-bordered rounded-xl h-10 md:h-12"
                                    placeholder="https://www.google.com/maps"
                                    type="text"
                                    name="googleMapsUrl"
                                    defaultValue={
                                        initialLocationData?.googleMapsUrl || ""
                                    }
                                    disabled={isLoading}
                                />
                            </label>

                            {error && (
                                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 lg:pt-2 mt-auto flex flex-col gap-4">
                                <button
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl btn-primary-solid py-3 md:py-3.5 shadow-md"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        "Creating..."
                                    ) : (
                                        <>
                                            {id ? "Update" : "Create"}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <Link
                                    to="/my-reports/locations"
                                    className="text-xs text-center font-semibold hover:text-wg-primary hover:underline cursor-pointer transition-all"
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
