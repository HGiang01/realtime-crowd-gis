export const incidentLayerLayout = {
    "icon-image": [
        "match", ["get", "category"],
        "education", "poi-education",
        "government", "poi-government",
        "landmark", "poi-landmark",
        "market", "poi-market",
        "medical", "poi-medical",
        "museum", "poi-museum",
        "park", "poi-park",
        "police", "poi-police",
        "religion", "poi-religion",
        "restroom", "poi-restroom",
        "tourism", "poi-tourism",
        "poi-other"
    ],
    "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.08, 15, 0.12],
    "icon-anchor": "center",
    "icon-allow-overlap": true,
    "text-field": ["to-string", ["coalesce", ["get", "name"], ""]],
    "text-font": ["Noto Sans Regular"],
    "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 14],
    "text-anchor": "top",
    "text-offset": [0, 1.5],
    "text-allow-overlap": false,
    "text-optional": true,
};

export const incidentLayerPaint = {
    "text-color": "#1e293b",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.5,
    "text-halo-blur": 0.5,
    "text-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0, 13, 1],
    "icon-opacity": 1,
};