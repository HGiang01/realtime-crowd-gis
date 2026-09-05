import { useState, useMemo, useCallback } from "react";
import { Header, SharedIncidentMap } from "@/component";
import { useStompSubscription } from "@/hook/useStompSubscription";
import { mapApi } from "@/api";
import { ImageViewer } from "../feature/report/component/ImageViewer.tsx";
import { formatTitleCase } from "@/util";

import {
    FilePlusCorner,
    MapPinPlus,
    Map as MapIcon,
    ShieldAlert,
    X,
    Phone,
    Globe,
    Clock,
    MapPin,
    Edit3,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Feature } from "geojson";

export interface RealtimeMessage {
    id: string;
    latitude: number;
    longitude: number;
    category?: string;
    level?: string;
    description?: string;
    timestamp?: string;
    imageUrls?: string[];
}

export type LocationCategory =
    | "education"
    | "government"
    | "landmark"
    | "market"
    | "medical"
    | "museum"
    | "park"
    | "police"
    | "religion"
    | "restroom"
    | "tourism"
    | "other";

export interface LocationDetailData {
    locationId: string;
    name: string;
    formattedAddress: string;
    category: LocationCategory;
    phone: string;
    website: string;
    operatingHours: string;
    googleMapsUrl: string;
    imageUrls: string[];
    latitude?: number;
    longitude?: number;
}

const LOCATION_CATEGORIES: LocationCategory[] = [
    "education",
    "government",
    "landmark",
    "market",
    "medical",
    "museum",
    "park",
    "police",
    "religion",
    "restroom",
    "tourism",
    "other",
];

export default function Home() {
    const [viewMode, setViewMode] = useState<"processing" | "location">(
        "location",
    );

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [locationDetail, setLocationDetail] =
        useState<LocationDetailData | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const [activeCategory, setActiveCategory] = useState<string>("");
    const [flyTarget, setFlyTarget] = useState<{
        latitude?: number;
        longitude?: number;
        id?: string;
        timestamp: number;
    } | null>(null);

    const [liveProcessing, setLiveProcessing] = useState<RealtimeMessage[]>([]);
    const [closedIds, setClosedIds] = useState<string[]>([]);

    useStompSubscription(
        "/topic/processing-incident-reports",
        (message: RealtimeMessage) => {
            setLiveProcessing((prev) => [...prev, message]);
        },
    );

    useStompSubscription(
        "/topic/closed-incident-reports",
        (message: RealtimeMessage) => {
            setClosedIds((prev) => [...prev, message.id]);
        },
    );

    const fetchAndShowDetail = async (id: string) => {
        if (!id) return;
        setIsDrawerOpen(true);
        setIsLoadingDetail(true);
        setLocationDetail(null);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await mapApi.getLocationDetail(id);
            const actualData =
                response?.data?.details ||
                response?.details ||
                response?.data ||
                response;
            setLocationDetail(actualData);

            // If the API suddenly provides latitude/longitude, use it directly
            if (actualData?.latitude && actualData?.longitude) {
                setFlyTarget({
                    latitude: actualData.latitude,
                    longitude: actualData.longitude,
                    id,
                    timestamp: Date.now(),
                });
            }
        } catch (error) {
            console.error("Error fetching location detail:", error);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleSearchSelect = (locationId: string) => {
        setViewMode("location");
        setActiveCategory("");

        // Fly to the location on the map when a search result is selected
        setFlyTarget({ id: locationId, timestamp: Date.now() });

        fetchAndShowDetail(locationId);
    };

    // Click on a map item (either live incident or location) to view details
    const handleViewDetails = useCallback(
        async (id: string, featureData?: Feature | null) => {
            if (viewMode === "location") {
                if (featureData?.geometry.type === "Point") {
                    setFlyTarget({
                        longitude: featureData.geometry.coordinates[0],
                        latitude: featureData.geometry.coordinates[1],
                        id: id,
                        timestamp: Date.now(),
                    });
                }
                await fetchAndShowDetail(id);
            } else {
                console.log(`Click Incident Processing ID:`, id);
            }
        },
        [viewMode],
    );

    const tileUrl =
        viewMode === "processing"
            ? import.meta.env.VITE_API_PROCESSING_INCIDENT_URL
            : import.meta.env.VITE_API_CURRENT_LOCATIONS_URL;

    const sourceLayerName =
        viewMode === "processing"
            ? import.meta.env.VITE_API_PROCESSING_INCIDENT_LAYER_NAME
            : import.meta.env.VITE_API_CURRENT_LOCATIONS_LAYER_NAME;

    const mapComponent = useMemo(
        () => (
            <SharedIncidentMap
                key={viewMode}
                mode={viewMode}
                tileUrl={tileUrl}
                sourceLayerName={sourceLayerName}
                newLiveIncidents={
                    viewMode === "processing" ? liveProcessing : []
                }
                hiddenIncidentIds={viewMode === "processing" ? closedIds : []}
                activeCategory={viewMode === "location" ? activeCategory : ""}
                onItemClick={handleViewDetails}
                flyToTarget={flyTarget}
            />
        ),
        [
            viewMode,
            tileUrl,
            sourceLayerName,
            liveProcessing,
            closedIds,
            activeCategory,
            handleViewDetails,
            flyTarget,
        ],
    );

    return (
        <div className="drawer relative min-h-screen overflow-hidden bg-wg-background text-on-wg-background">
            <input
                id="location-sidebar-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={isDrawerOpen}
                onChange={(e) => setIsDrawerOpen(e.target.checked)}
            />

            <div className="drawer-content flex flex-col h-screen">
                <Header onSearchSelect={handleSearchSelect} />

                <main className="flex-1 relative w-full h-full flex flex-col">
                    <div className="absolute inset-0">{mapComponent}</div>

                    {viewMode === "location" && (
                        <div className="absolute top-4 left-0 right-0 z-40 px-12 pointer-events-none mt-2">
                            <div className="flex gap-2 overflow-x-auto justify-start md:justify-center items-center pb-2 pointer-events-auto hide-scrollbar">
                                {LOCATION_CATEGORIES.map((category) => {
                                    const isActive =
                                        activeCategory === category;
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() =>
                                                setActiveCategory(
                                                    isActive ? "" : category,
                                                )
                                            }
                                            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors shadow-sm cursor-pointer border
                                                ${
                                                    isActive
                                                        ? "bg-blue-600 text-white border-transparent"
                                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                                }`}
                                        >
                                            {formatTitleCase(category)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="absolute mb-2 bottom-10 md:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white p-1 rounded-xl shadow-lg flex gap-1 pointer-events-auto border border-gray-200 w-[90%] md:w-auto max-w-[340px] md:max-w-none">
                        <button
                            onClick={() => setViewMode("location")}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2 md:px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
                                viewMode === "location"
                                    ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                                    : "text-gray-500 hover:bg-gray-50 border border-transparent"
                            }`}
                        >
                            <MapIcon className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="whitespace-nowrap">
                                Local Places
                            </span>
                        </button>
                        <button
                            onClick={() => setViewMode("processing")}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2 md:px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
                                viewMode === "processing"
                                    ? "bg-red-50 text-red-600 shadow-sm border border-red-100"
                                    : "text-gray-500 hover:bg-gray-50 border border-transparent"
                            }`}
                        >
                            <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="whitespace-nowrap">
                                Live Incidents
                            </span>
                        </button>
                    </div>

                    <div className="absolute bottom-24 md:bottom-10 right-2 md:right-4 z-10 pointer-events-none">
                        <div className="p-2 flex flex-col md:flex-row gap-3 md:gap-4 pointer-events-auto items-end">
                            <Link
                                to="/location-reports/create"
                                className="rounded-full p-2 md:px-3 md:py-1.5 btn-primary-solid flex items-center shadow-lg hover:shadow-xl transition-shadow"
                                title="Update Map data"
                            >
                                <div className="md:mr-2 p-2.5 md:p-2 rounded-full bg-white text-wg-primary flex items-center justify-center">
                                    <MapPinPlus className="w-5 h-5 md:w-5 md:h-5" />
                                </div>
                                <div className="hidden md:flex flex-col text-left py-1 pr-2">
                                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                                        Update
                                    </p>
                                    <h2 className="text-sm font-semibold leading-tight">
                                        Map data
                                    </h2>
                                </div>
                            </Link>

                            <Link
                                to="/incident-reports/create"
                                className="rounded-full p-2 md:px-3 md:py-1.5 btn-warning-solid flex items-center shadow-lg hover:shadow-xl transition-shadow"
                                title="Report An incident"
                            >
                                <div className="md:mr-2 p-2.5 md:p-2 rounded-full bg-white text-wg-warning flex items-center justify-center">
                                    <FilePlusCorner className="w-5 h-5 md:w-5 md:h-5" />
                                </div>
                                <div className="hidden md:flex flex-col text-left py-1 pr-2">
                                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                                        Report
                                    </p>
                                    <h2 className="text-sm font-semibold leading-tight">
                                        An incident
                                    </h2>
                                </div>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>

            <div className="drawer-side z-50">
                <label
                    htmlFor="location-sidebar-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>
                <div className="menu bg-white min-h-full w-96 p-0 shadow-2xl text-gray-800 flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                        <h3 className="font-bold text-lg">Location Details</h3>
                        <div className="flex gap-2">
                            {locationDetail && (
                                <Link
                                    to={`/location-reports/create/${locationDetail.locationId}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-bold transition-colors"
                                >
                                    <Edit3 size={16} />
                                    <span>Update</span>
                                </Link>
                            )}
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-white">
                        {isLoadingDetail ? (
                            <div className="flex justify-center items-center h-40">
                                <span className="loading loading-spinner loading-lg text-blue-500"></span>
                            </div>
                        ) : locationDetail ? (
                            <div className="flex flex-col gap-6 fade-up">
                                {locationDetail.imageUrls &&
                                    locationDetail.imageUrls.length > 0 && (
                                        <div className="w-full h-52 rounded-xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 flex items-center justify-center">
                                            <ImageViewer
                                                images={locationDetail.imageUrls.map(
                                                    (img) =>
                                                        img.startsWith("http")
                                                            ? img
                                                            : `${import.meta.env.VITE_FILE_PUBLIC_URL_PREFIX}/${img}`,
                                                )}
                                            />
                                        </div>
                                    )}

                                <div>
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100 tracking-wide mb-3 shadow-sm">
                                        {formatTitleCase(
                                            locationDetail.category || "",
                                        )}
                                    </span>
                                    <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                                        {locationDetail.name}
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-4 text-[15px] text-gray-700 mt-2">
                                    {locationDetail.formattedAddress && (
                                        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <MapPin
                                                size={18}
                                                className="text-blue-500 mt-0.5 shrink-0"
                                            />
                                            <span className="leading-relaxed">
                                                {
                                                    locationDetail.formattedAddress
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {locationDetail.phone && (
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <Phone
                                                size={18}
                                                className="text-blue-500 shrink-0"
                                            />
                                            <span className="font-semibold text-gray-900">
                                                {locationDetail.phone}
                                            </span>
                                        </div>
                                    )}
                                    {locationDetail.website && (
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <Globe
                                                size={18}
                                                className="text-blue-500 shrink-0"
                                            />
                                            <a
                                                href={
                                                    locationDetail.website.startsWith(
                                                        "http",
                                                    )
                                                        ? locationDetail.website
                                                        : `https://${locationDetail.website}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 font-medium hover:underline truncate"
                                            >
                                                {locationDetail.website}
                                            </a>
                                        </div>
                                    )}
                                    {locationDetail.operatingHours && (
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <Clock
                                                size={18}
                                                className="text-blue-500 shrink-0"
                                            />
                                            <span className="font-medium text-gray-800">
                                                {locationDetail.operatingHours}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {locationDetail.googleMapsUrl && (
                                    <a
                                        href={locationDetail.googleMapsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <MapPin size={18} />
                                        Open in Google Maps
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 mt-10">
                                Location data not found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
