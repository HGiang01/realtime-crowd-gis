import { useRef, useState } from "react";
import { formatDateToLocaleVI } from "@/util";

interface IncidentPopupProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: any;
    hideActions?: boolean;
    onClaim?: (id: string) => Promise<void> | void;
    onViewDetails?: (id: string) => void;
}

const getLevelConfig = (level: string) => {
    const l = level?.toLowerCase();
    if (l === "high")
        return {
            tipHex: "#ef4444",
            borderClass: "border-red-500",
            badgeClass: "bg-red-500",
        };
    if (l === "medium")
        return {
            tipHex: "#facc15",
            borderClass: "border-yellow-400",
            badgeClass: "bg-yellow-500",
        };
    if (l === "low")
        return {
            tipHex: "#9ca3af",
            borderClass: "border-gray-400",
            badgeClass: "bg-gray-500",
        };
    return {
        tipHex: "#e5e7eb",
        borderClass: "border-gray-200",
        badgeClass: "bg-gray-400",
    };
};

export default function IncidentPopup({
    properties,
    hideActions = false,
    onClaim,
    onViewDetails,
}: IncidentPopupProps) {
    const carouselRef = useRef<HTMLDivElement>(null);

    // State for managing the loading state of the "Claim" button
    const [isClaiming, setIsClaiming] = useState(false);

    const {
        id,
        level = "N/A",
        category = "N/A",
        description = "Description not available.",
        created_at = "",
    } = properties;

    let imageUrls: string[] = [];
    if (properties.image_urls) {
        imageUrls = properties.image_urls
            .replace(/^\{|\}$/g, "")
            .split(",")
            .filter((url: string) => url.trim() !== "")
            .map(
                (url: string) =>
                    `${import.meta.env.VITE_FILE_PUBLIC_URL_PREFIX}/${url.trim()}`,
            );
    }

    const { tipHex, borderClass, badgeClass } = getLevelConfig(level);

    if (!id && level === "N/A")
        return <div className="p-2 text-xs text-gray-500">Invalid Data</div>;

    const scrollLeft = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (carouselRef.current)
            carouselRef.current.scrollBy({ left: -230, behavior: "smooth" });
    };

    const scrollRight = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (carouselRef.current)
            carouselRef.current.scrollBy({ left: 230, behavior: "smooth" });
    };

    // Handle the "Claim" button click
    const handleClaimClick = async () => {
        if (!onClaim || !id) return;
        setIsClaiming(true);
        try {
            await onClaim(id);
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <>
            <style>{`
                .maplibregl-popup-content { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
                .maplibregl-popup-tip { display: block !important; opacity: 1 !important; }
                .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: ${tipHex} !important; }
                .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: ${tipHex} !important; }
                .maplibregl-popup-close-button { top: 10px !important; right: 10px !important; width: 24px !important; height: 24px !important; font-size: 20px !important; color: #6b7280 !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; }
                .maplibregl-popup-close-button:hover { color: #000000 !important; background-color: #f3f4f6 !important; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div
                className={`w-57.5 min-w-57.5 shrink-0 font-sans bg-white border-[3px] ${borderClass} p-3 rounded-xl shadow-xl relative`}
            >
                {/* Headers */}
                <div className="flex justify-between items-start mb-2.5">
                    <div className="flex gap-1 z-30 pointer-events-none">
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                            {category}
                        </span>
                        <span
                            className={`px-1.5 py-0.5 ${badgeClass} text-white text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm`}
                        >
                            {level}
                        </span>
                    </div>
                </div>

                {/* Images */}
                {imageUrls.length > 0 && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden shadow-sm group bg-gray-100 mb-2.5">
                        <div
                            ref={carouselRef}
                            className="hide-scrollbar flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
                        >
                            {imageUrls.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="w-full h-full shrink-0 snap-center relative"
                                >
                                    <img
                                        src={img}
                                        className="w-full h-full object-cover"
                                        onError={(e) =>
                                            (e.currentTarget.style.display =
                                                "none")
                                        }
                                        alt="incident"
                                    />
                                </div>
                            ))}
                        </div>

                        {imageUrls.length > 1 && (
                            <>
                                <button
                                    onClick={scrollLeft}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={scrollRight}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}

                        {created_at && (
                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[9px] text-white/90 font-medium z-30 drop-shadow-md">
                                <span>{formatDateToLocaleVI(created_at)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Description */}
                <div className="px-0.5 mb-2">
                    <p
                        className={`text-[11px] text-gray-800 leading-relaxed ${imageUrls.length > 0 ? "line-clamp-2" : "line-clamp-3"}`}
                        title={description}
                    >
                        {description}
                    </p>
                </div>

                {/* Action buttons */}
                {id && !hideActions && (onClaim || onViewDetails) && (
                    <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-gray-100 w-full">
                        {onClaim && (
                            <button
                                onClick={handleClaimClick}
                                disabled={isClaiming}
                                className="flex-1 flex justify-center items-center h-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[10px] font-semibold rounded-md shadow-sm transition-colors"
                            >
                                {isClaiming ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Claiming...
                                    </>
                                ) : (
                                    "Claim"
                                )}
                            </button>
                        )}
                        {onViewDetails && (
                            <button
                                onClick={() => onViewDetails(id)}
                                disabled={isClaiming}
                                className="flex-1 flex justify-center items-center h-6 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 text-[10px] font-semibold rounded-md border border-gray-200 shadow-sm"
                            >
                                Details
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
