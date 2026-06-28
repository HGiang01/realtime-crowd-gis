import { formatDateToLocaleVI } from "@/util";

const getLevelConfig = (level: string) => {
    const l = level?.toLowerCase();
    if (l === "high") return { tipHex: "#ef4444", borderClass: "border-red-500", badgeClass: "bg-red-500" };
    if (l === "medium") return { tipHex: "#facc15", borderClass: "border-yellow-400", badgeClass: "bg-yellow-500" };
    if (l === "low") return { tipHex: "#9ca3af", borderClass: "border-gray-400", badgeClass: "bg-gray-500" };
    return { tipHex: "#e5e7eb", borderClass: "border-gray-200", badgeClass: "bg-gray-400" };
};

export const getIncidentPopupHtml = (properties: any): string => {
    const {
        id,
        level = "N/A",
        category = "N/A",
        description = "Description not available",
        created_at = "",
    } = properties;

    if (!id && level === "N/A") {
        return `<div class="p-2 text-xs text-gray-500">Dữ liệu không hợp lệ</div>`;
    }

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

    const badgesHtml = `
        <div class="flex gap-1 z-30 pointer-events-none">
            <span class="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                ${category}
            </span>
            <span class="px-1.5 py-0.5 ${badgeClass} text-white text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                ${level}
            </span>
        </div>
    `;

    const actionsHtml = id ? `
        <div class="flex gap-2 mt-2.5 pt-2.5 border-t border-gray-100 w-full">
            <button onclick="window.handleClaim('${id}')" class="flex-1 flex justify-center items-center h-6 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded-md transition-colors shadow-sm cursor-pointer">
                Claim
            </button>
            <button onclick="window.handleViewDetails('${id}')" class="flex-1 flex justify-center items-center h-6 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-md transition-colors shadow-sm border border-gray-200 cursor-pointer">
                Details
            </button>
        </div>
    ` : '';

    const overrideCss = `
        <style>
            .maplibregl-popup-content {
                background: transparent !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
            
            .maplibregl-popup-tip {
                display: block !important; /* Hiện lại chân nhọn */
                opacity: 1 !important;
            }

            .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: ${tipHex} !important; }
            .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: ${tipHex} !important; }
            .maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color: ${tipHex} !important; }
            .maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color: ${tipHex} !important; }
            .maplibregl-popup-anchor-top-left .maplibregl-popup-tip { border-bottom-color: ${tipHex} !important; }
            .maplibregl-popup-anchor-top-right .maplibregl-popup-tip { border-bottom-color: ${tipHex} !important; }
            .maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip { border-top-color: ${tipHex} !important; }
            .maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip { border-top-color: ${tipHex} !important; }

            .maplibregl-popup-close-button {
                top: 10px !important;
                right: 10px !important;
                width: 24px !important;
                height: 24px !important;
                font-size: 20px !important;
                color: #6b7280 !important; /* Xám dịu */
                background-color: transparent !important;
                border: none !important;
                z-index: 50 !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .maplibregl-popup-close-button:hover {
                color: #000000 !important; /* Đen tuyền khi rê chuột */
                background-color: #f3f4f6 !important; /* Vòng tròn xám nhạt ôm lấy nút X */
            }
            .maplibregl-popup-close-button:focus {
                outline: none !important;
            }
        </style>
    `;

    if (imageUrls.length > 0) {
        return `
            ${overrideCss}
            <div class="w-[230px] min-w-[230px] shrink-0 font-sans bg-white border-[3px] ${borderClass} p-3 rounded-xl shadow-xl relative">
                
                <div class="flex justify-between items-start mb-2.5">
                    ${badgesHtml}
                    <div class="w-5 h-5 shrink-0"></div> 
                </div>

                <div class="relative w-full h-32 rounded-lg overflow-hidden shadow-sm group bg-gray-100 mb-2.5">
                    <div id="popup-carousel-${id}" 
                         class="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
                         style="scrollbar-width: none; -ms-overflow-style: none;">
                        <style>#popup-carousel-${id}::-webkit-scrollbar { display: none; }</style>
                        
                        ${imageUrls.map((img) => `
                            <div class="w-full h-full shrink-0 snap-center relative">
                                <img src="${img}" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
                                <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none"></div>
                            </div>
                        `).join("")}
                    </div>

                    ${imageUrls.length > 1 ? `
                        <button onclick="document.getElementById('popup-carousel-${id}').scrollBy({left: -230, behavior: 'smooth'})" class="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onclick="document.getElementById('popup-carousel-${id}').scrollBy({left: 230, behavior: 'smooth'})" class="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    ` : ""}

                    ${created_at ? `
                        <div class="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[9px] text-white/90 font-medium z-30 pointer-events-none">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                            <span>${formatDateToLocaleVI(created_at)}</span>
                        </div>
                    ` : ""}
                </div>

                <div class="px-0.5">
                    <p class="text-[11px] text-gray-800 leading-relaxed line-clamp-2" title="${description}">${description}</p>
                </div>
                ${actionsHtml}
            </div>
        `;
    }

    return `
        ${overrideCss}
        <div class="w-[230px] min-w-[230px] shrink-0 font-sans bg-white border-[3px] ${borderClass} p-3 rounded-xl shadow-xl relative">
            
            <div class="flex justify-between items-start mb-2.5">
                ${badgesHtml}
                <div class="w-5 h-5 shrink-0"></div>
            </div>
            
            <p class="text-[11px] text-gray-800 leading-relaxed mb-2 line-clamp-3">${description}</p>
            
            ${created_at ? `
                <div class="flex items-center gap-1 text-[9px] text-gray-500 pt-1 pb-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span>${formatDateToLocaleVI(created_at)}</span>
                </div>
            ` : ""}
            ${actionsHtml}
        </div>
    `;
};