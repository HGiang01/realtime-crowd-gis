import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import { getIncidentPopupHtml } from "@/util";

type MapInteractionMode = "none" | "coordinate" | "info";

interface MapProps {
    className?: string;
    startingCoordinate?: { lng: number; lat: number } | null;
    mode?: MapInteractionMode;
    externalCoordinate?: { lng: number; lat: number } | null;
    interactiveLayerIds?: string[];
    // Vector tile source URL
    tileUrl?: string;
    // Database view name for the vector tile source
    sourceLayerName?: string;
    onMapClick?: (lng: number, lat: number, featureData?: any) => void;
}

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const MAP_BOUNDS: [number, number, number, number] = [
    106.684456, 10.73179, 106.89045, 10.921472,
];

const createCoordinatePopupContent = (lng: number, lat: number): string => `
    <div style="font-size: 13px; color: #333; overflow-y: auto;">
        <strong style="font-size: 14px;">Coordinate</strong>
        <hr style="margin: 5px 0; border-color: #e5e7eb;"/>
        <div style="font-size: 14px;">
            <strong>Lng:</strong> ${lng.toFixed(6)}<br/>
            <strong>Lat:</strong> ${lat.toFixed(6)}
        </div>
    </div>
`;

const createErrorPopupContent = (): string => `
    <div style="font-size: 14px; color: #d32f2f;">
        <strong>Find Location Error!</strong><br/>
        <hr style="margin: 5px 0; border-color: #e5e7eb;"/>
        Invalid coordinates or outside the boundary
    </div>
`;

export default function Map({
    className = "",
    mode = "none",
    startingCoordinate = undefined,
    onMapClick,
    externalCoordinate,
    interactiveLayerIds = [],
    // Default values match your current Spring Boot API setup
    tileUrl,
    sourceLayerName,
}: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const popupRef = useRef<maplibregl.Popup | null>(null);
    const propsRef = useRef({ mode, onMapClick, interactiveLayerIds });

    useEffect(() => {
        propsRef.current = { mode, onMapClick, interactiveLayerIds };

        if (popupRef.current) popupRef.current.remove();

        if (map.current) {
            map.current.getCanvas().style.cursor =
                mode !== "none" ? "crosshair" : "grab";
        }
    }, [mode, interactiveLayerIds, onMapClick]);

    useEffect(() => {
        if (!mapContainer.current) return;

        const officialProtomapsStyle: maplibregl.StyleSpecification = {
            version: 8,
            glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
            sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
            sources: {
                protomaps: {
                    type: "vector",
                    url: `pmtiles://${window.location.origin}/thu_duc_city.pmtiles`,
                    attribution:
                        '<a href="https://protomaps.com">Protomaps</a>',
                },
            },
            layers: layers("protomaps", namedFlavor("light"), { lang: "vi" }),
        };

        // Initial map configuration
        const mapConfig: maplibregl.MapOptions = {
            container: mapContainer.current,
            style: officialProtomapsStyle,
            minZoom: 10,
            maxZoom: 20,
            maxBounds: MAP_BOUNDS,
        };

        if (startingCoordinate) {
            mapConfig.center = [startingCoordinate.lng, startingCoordinate.lat];
            mapConfig.zoom = 10;
        } else {
            mapConfig.bounds = MAP_BOUNDS;
            mapConfig.fitBoundsOptions = { padding: 15 };
        }

        map.current = new maplibregl.Map(mapConfig);
        map.current.addControl(new maplibregl.NavigationControl(), "top-right");

        const resizeObserver = new ResizeObserver(() => {
            map.current?.resize();
        });
        resizeObserver.observe(mapContainer.current);

        map.current.on("click", (e) => {
            const { lng, lat } = e.lngLat;
            const { mode, interactiveLayerIds, onMapClick } = propsRef.current;

            if (mode === "none") return;

            if (!popupRef.current) {
                popupRef.current = new maplibregl.Popup({
                    closeOnClick: false,
                });
            }

            if (mode === "coordinate") {
                popupRef.current
                    .setLngLat([lng, lat])
                    .setHTML(createCoordinatePopupContent(lng, lat))
                    .addTo(map.current!);

                if (onMapClick) onMapClick(lng, lat);
            } else if (mode === "info") {
                // If specified, use the filter.
                const queryParams =
                    interactiveLayerIds.length > 0
                        ? { layers: interactiveLayerIds }
                        : undefined;
                const features = map.current!.queryRenderedFeatures(
                    e.point,
                    queryParams,
                );

                // Remove background layers that have no useful data (like earth, background)
                const validFeatures = features.filter(
                    (f) => Object.keys(f.properties).length > 0,
                );

                if (validFeatures.length > 0) {
                    // Get the top-most feature that actually has data
                    const featureData = validFeatures[0];
                    const sourceLayer =
                        featureData.sourceLayer || featureData.layer.id;

                    const propsHtml = Object.entries(
                        featureData.properties || {},
                    )
                        .map(
                            ([key, val]) =>
                                `<div class="mb-1 text-xs"><b>${key}:</b> ${val}</div>`,
                        )
                        .join("");

                    popupRef.current
                        .setLngLat([lng, lat])
                        .setHTML(getIncidentPopupHtml(featureData.properties))
                        .addTo(map.current!);

                    if (onMapClick) onMapClick(lng, lat, featureData);
                } else {
                    popupRef.current.remove();
                }
            }
        });

        let animationId: number;

        map.current.on("load", async () => {
            if (map.current) {
                map.current.resize();

                if (propsRef.current.mode == "none") {
                    map.current.getCanvas().style.cursor = "grab";
                } else if (propsRef.current.mode == "info") {
                    map.current.getCanvas().style.cursor = "default";
                } else if (propsRef.current.mode == "coordinate") {
                    map.current.getCanvas().style.cursor = "crosshair";
                }

                const iconsToLoad = [
                    { name: "education", url: "/icons/education.png" },
                    { name: "government", url: "/icons/government.png" },
                    { name: "landmark", url: "/icons/landmark.png" },
                    { name: "market", url: "/icons/market.png" },
                    { name: "medical", url: "/icons/medical.png" },
                    { name: "museum", url: "/icons/museum.png" },
                    { name: "other", url: "/icons/other.png" },
                    { name: "park", url: "/icons/park.png" },
                    { name: "police", url: "/icons/police.png" },
                    { name: "religion", url: "/icons/religion.png" },
                    { name: "restroom", url: "/icons/restroom.png" },
                    { name: "tourism", url: "/icons/tourism.png" },
                ];

                await Promise.all(
                    iconsToLoad.map(async (icon) => {
                        const image = await map.current!.loadImage(icon.url);
                        if (map.current && !map.current.hasImage(icon.name)) {
                            map.current.addImage(icon.name, image.data);
                        }
                    }),
                ).catch((error) =>
                    console.error("Error loading icons for map: ", error),
                );

                if (tileUrl && sourceLayerName) {
                    // Add a vector tile source from Spring Boot API
                    map.current.addSource("pending-reports-source", {
                        type: "vector",
                        tiles: [tileUrl],
                    });

                    map.current.addLayer({
                        id: "pending-reports-layer",
                        type: "symbol",
                        source: "pending-reports-source",
                        "source-layer": sourceLayerName,

                        layout: {
                            // Icon configuration
                            "icon-image": [
                                "match",
                                ["get", "category"], // Match the 'category' property to determine which icon to use
                                "education",
                                "education",
                                "government",
                                "government",
                                "landmark",
                                "landmark",
                                "market",
                                "market",
                                "medical",
                                "medical",
                                "museum",
                                "museum",
                                "park",
                                "park",
                                "police",
                                "police",
                                "religion",
                                "religion",
                                "restroom",
                                "restroom",
                                "tourism",
                                "tourism",
                                "other", // Default icon if no match
                            ],

                            // Icon size configuration based on zoom level
                            "icon-size": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                10,
                                0.08,
                                15,
                                0.12,
                            ],

                            // Positioning and overlap settings for icons
                            "icon-anchor": "center",
                            "icon-rotate": 0,
                            "icon-offset": [0, 0],
                            "icon-allow-overlap": true,
                            "icon-ignore-placement": false,

                            // Text label configuration for the icons
                            "text-field": [
                                "case",
                                [
                                    ">",
                                    [
                                        "length",
                                        [
                                            "to-string",
                                            [
                                                "coalesce",
                                                ["get", "category"],
                                                "",
                                            ],
                                        ],
                                    ],
                                    12,
                                ],
                                [
                                    "concat",
                                    [
                                        "slice",
                                        [
                                            "to-string",
                                            [
                                                "coalesce",
                                                ["get", "category"],
                                                "",
                                            ],
                                        ],
                                        0,
                                        12,
                                    ],
                                    "...",
                                ],
                                [
                                    "to-string",
                                    ["coalesce", ["get", "category"], ""],
                                ],
                            ],

                            "text-font": ["Noto Sans Regular"], // Required matching with glyphs
                            "text-size": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                12,
                                10,
                                16,
                                14,
                            ],

                            // Positioning and overlap settings for text labels
                            "text-anchor": "top",
                            "text-offset": [0, 1.2],
                            "text-justify": "center",

                            // Text styling and appearance settings
                            "text-transform": "none",
                            "text-letter-spacing": 0.05,
                            "text-max-width": 8,

                            // Overlap and optional display settings for text labels
                            "text-allow-overlap": false,
                            "text-optional": true,
                        },

                        // Paint properties for styling the icons and text labels
                        paint: {
                            "text-color": "#1e293b",

                            "text-halo-color": "#ffffff",
                            "text-halo-width": 1.5,
                            "text-halo-blur": 0.5,

                            "text-opacity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                11,
                                0,
                                13,
                                1,
                            ],

                            "icon-opacity": 1,
                            "icon-translate": [0, 0],
                        },
                    });
                }

                const startTime = performance.now();
                const animateMarker = (timestamp: number) => {
                    const elapsedTime = timestamp - startTime;
                    const opacity = 0.65 + Math.sin(elapsedTime / 200) * 0.35;
                    if (map.current?.getLayer("pending-reports-layer")) {
                        map.current.setPaintProperty(
                            "pending-reports-layer",
                            "circle-opacity",
                            opacity,
                        );
                        map.current.setPaintProperty(
                            "pending-reports-layer",
                            "circle-stroke-opacity",
                            opacity,
                        );

                        map.current.setPaintProperty(
                            "pending-reports-layer",
                            "circle-radius",
                            5 + Math.sin(elapsedTime / 200) * 2,
                        );
                    }

                    animationId = requestAnimationFrame(animateMarker);
                };

                animateMarker(performance.now());

                // Open pop-up if component receives a starting coordinate prop
                if (startingCoordinate) {
                    if (!popupRef.current) {
                        popupRef.current = new maplibregl.Popup({
                            closeOnClick: false,
                        });
                    }

                    const { lng, lat } = startingCoordinate;

                    popupRef.current
                        .setLngLat([lng, lat])
                        .setHTML(createCoordinatePopupContent(lng, lat))
                        .addTo(map.current);
                }
            }
        });

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            map.current?.remove();
            popupRef.current?.remove();
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!map.current || !externalCoordinate) return;

        const { lng, lat } = externalCoordinate;
        if (!popupRef.current)
            popupRef.current = new maplibregl.Popup({ closeOnClick: false });

        const isWithinBounds =
            lng >= MAP_BOUNDS[0] &&
            lng <= MAP_BOUNDS[2] &&
            lat >= MAP_BOUNDS[1] &&
            lat <= MAP_BOUNDS[3];

        if (isWithinBounds) {
            map.current.flyTo({ center: [lng, lat], zoom: 16 });
            popupRef.current
                .setLngLat([lng, lat])

                .setHTML(createCoordinatePopupContent(lng, lat))
                .addTo(map.current);
        } else {
            popupRef.current
                .setLngLat(map.current.getCenter())
                .setHTML(createErrorPopupContent())
                .addTo(map.current);
        }
    }, [externalCoordinate]);

    return <div className={`${className}`} ref={mapContainer}></div>;
}
