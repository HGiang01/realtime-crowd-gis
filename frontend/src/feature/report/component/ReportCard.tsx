import React from "react";
import {
    AlertTriangle,
    Check,
    HandHeart,
    Import,
    Landmark,
    Leaf,
    MapPin,
    RefreshCcw,
    Road,
    ShieldAlert,
    TrafficCone,
    Volume2,
    X,
} from "lucide-react";
import type { Report } from "@/type";
import { Link } from "react-router-dom";
import { formatTitleCase, formatDateToLocaleVI } from "@/util";

interface ReportCardProps {
    locationData?: Report.LocationList;
    incidentData?: Report.IncidentList;
    actionLabel?: string;
    actionLink: string;
}

const CATEGORY_ICONS: Record<Report.IncidentCategory, React.ReactNode> = {
    infrastructure: <TrafficCone className="h-5 w-5 text-amber-500" />,
    traffic: <Road className="h-5 w-5 text-slate-500" />,
    environment: <Leaf className="h-5 w-5 text-green-500" />,
    noise: <Volume2 className="h-5 w-5 text-indigo-500" />,
    security: <ShieldAlert className="h-5 w-5 text-red-500" />,
    healthy_safety: <HandHeart className="h-5 w-5 text-teal-500" />,
    administrative: <Landmark className="h-5 w-5 text-blue-500" />,
    other: <AlertTriangle className="h-5 w-5 text-wg-primary" />,
};

const STATUS_CONFIG: Record<
    Report.Status,
    { className: string; icon: React.ReactNode }
> = {
    pending_review: {
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: <Import size={12} />,
    },
    processing: {
        className: "bg-blue-50 text-blue-600 border-blue-200",
        icon: <RefreshCcw size={12} />,
    },
    approved: {
        className: "bg-green-50 text-green-600 border-green-200",
        icon: <Check size={12} />,
    },
    rejected: {
        className: "bg-red-50 text-red-600 border-gray-200",
        icon: <X size={12} />,
    },
};

const LEVEL_CONFIG: Record<
    Report.IncidentLevel,
    { className: string; label: string }
> = {
    low: {
        className: "text-green-700 bg-green-50 border-green-200",
        label: "Low",
    },
    medium: {
        className: "text-amber-700 bg-amber-50 border-amber-200",
        label: "Medium",
    },
    high: { className: "text-red-700 bg-red-50 border-red-200", label: "High" },
};

const StatusBadge = ({ status }: { status: Report.Status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_review;
    return (
        <div
            className={`px-2 py-1 text-[11px] inline-flex items-center gap-1 font-medium rounded-md border whitespace-nowrap ${config.className}`}
        >
            {config.icon}
            {formatTitleCase(status)}
        </div>
    );
};

const LevelBadge = ({ level }: { level: Report.IncidentLevel }) => {
    const config = LEVEL_CONFIG[level];
    if (!config) return null;
    return (
        <span
            className={`text-[10px] px-0.5 border rounded uppercase tracking-wider ${config.className}`}
        >
            {config.label}
        </span>
    );
};

export const ReportCard = React.memo(
    ({
        locationData,
        incidentData,
        actionLabel = "View details",
        actionLink,
    }: ReportCardProps) => {
        const data = locationData || incidentData;
        const isLocation = !!locationData;

        if (!data) return null;

        return (
            <div className="flex flex-col h-full rounded-2xl border border-wg-outline-variant bg-wg-surface-container-lowest p-5 transition-shadow hover:shadow-md">
                {/* 1. Header Section */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-start gap-3">
                        {!isLocation && incidentData && (
                            <div className="mt-1">
                                {CATEGORY_ICONS[incidentData.category] ||
                                    CATEGORY_ICONS.other}
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-on-wg-surface leading-tight">
                                {isLocation
                                    ? locationData.name
                                    : formatTitleCase(incidentData!.category)}
                            </h3>
                            <div className="mt-1">
                                {isLocation ? (
                                    <p className="text-xs text-on-wg-surface-variant">
                                        {formatTitleCase(locationData.category)}
                                    </p>
                                ) : (
                                    <LevelBadge level={incidentData!.level} />
                                )}
                            </div>
                        </div>
                    </div>
                    <StatusBadge status={data.status} />
                </div>

                {/* 2. Body Section */}
                <div className="mb-4 flex-1">
                    {isLocation ? (
                        <div className="flex items-start gap-2 text-xs text-on-wg-surface-variant">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                                {locationData.formattedAddress}
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-on-wg-surface-variant line-clamp-3">
                            {incidentData!.description}
                        </p>
                    )}
                </div>

                {/* 3. Footer Section */}
                <div className="pt-4 mt-auto border-t border-wg-outline-variant flex items-center justify-between text-xs">
                    <span className="text-on-wg-surface-variant">
                        Sent at: {formatDateToLocaleVI(data.createdAt)}
                    </span>
                    <Link
                        to={actionLink}
                        className="font-semibold text-wg-primary hover:underline cursor-pointer transition-all"
                    >
                        {actionLabel}
                    </Link>
                </div>
            </div>
        );
    },
);

ReportCard.displayName = "ReportCard";
