import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, Feature } from "geojson";
import type {
    SymbolLayerSpecification,
    CircleLayerSpecification,
    FilterSpecification,
} from "maplibre-gl";

import BaseMap from "../core/BaseMap";
import { ICONS_TO_LOAD } from "../config/mapConfig";
import { incidentLayerLayout, incidentLayerPaint } from "../config/layerStyles";
import IncidentPopup from "../component/IncidentPopup";

export interface LiveIncidentData {
    id: string;
    latitude: number;
    longitude: number;
    category?: string;
    level?: string;
    description?: string;
    timestamp?: string;
    imageUrls?: string[];
}

interface SharedIncidentMapProps {
    mode: "location" | "processing";
    tileUrl: string;
    sourceLayerName: string;
    onItemClick?: (id: string, featureData?: Feature | null) => void;
    newLiveIncidents?: LiveIncidentData[];
    hiddenIncidentIds?: string[];
    activeCategory?: string;
    flyToTarget?: {
        latitude?: number;
        longitude?: number;
        id?: string;
        timestamp: number;
    } | null;
}

export default function SharedIncidentMap({
    mode,
    tileUrl,
    sourceLayerName,
    onItemClick,
    newLiveIncidents = [],
    hiddenIncidentIds = [],
    activeCategory,
    flyToTarget,
}: SharedIncidentMapProps) {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const popupRef = useRef<maplibregl.Popup>(
        new maplibregl.Popup({ closeOnClick: false }),
    );
    const popupContainerRef = useRef<HTMLDivElement>(
        document.createElement("div"),
    );

    const rootRef = useRef<Root | null>(null);
    const animationId = useRef<number>(0);
    const isAnimating = useRef<boolean>(true);
    const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

    // Fly to target when flyToTarget changes
    useEffect(() => {
        if (!mapRef.current || !flyToTarget) return;
        const map = mapRef.current;

        // Case 1: click from search with lat/long available
        if (flyToTarget.longitude && flyToTarget.latitude) {
            map.flyTo({
                center: [flyToTarget.longitude, flyToTarget.latitude],
                zoom: 16,
                speed: 1.2,
                curve: 1.4,
            });
            return;
        }

        // Case 2: click from search with only ID available, need to query features in current tiles
        if (flyToTarget.id) {
            setTimeout(() => {
                const features = map.querySourceFeatures("shared-source", {
                    sourceLayer: sourceLayerName,
                    filter: ["==", ["get", "id"], flyToTarget.id],
                });

                if (features && features.length > 0) {
                    const feature = features[0];
                    if (feature.geometry.type === "Point") {
                        const coords = [
                            feature.geometry.coordinates[0],
                            feature.geometry.coordinates[1],
                        ] as [number, number];
                        map.flyTo({
                            center: coords,
                            zoom: 16,
                            speed: 1.2,
                            curve: 1.4,
                        });
                    }
                } else {
                    console.warn("No feature found for ID: " + flyToTarget.id);
                }
            }, 300);
        }
    }, [flyToTarget, sourceLayerName]);

    useEffect(() => {
        isAnimating.current = true;
        if (!rootRef.current)
            rootRef.current = createRoot(popupContainerRef.current);
        return () => {
            isAnimating.current = false;
            if (animationId.current) cancelAnimationFrame(animationId.current);
            setTimeout(() => {
                if (rootRef.current) {
                    rootRef.current.unmount();
                    rootRef.current = null;
                }
            }, 0);
        };
    }, []);

    // Auto update the filter for hidden incidents and active category
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;
        const map = mapRef.current;

        const filterExpressions: unknown[] = ["all"];

        if (activeCategory) {
            filterExpressions.push(["==", ["get", "category"], activeCategory]);
        }
        hiddenIncidentIds.forEach((id) => {
            filterExpressions.push(["!=", ["get", "id"], id]);
        });

        const finalFilter =
            filterExpressions.length > 1 ? filterExpressions : null;

        if (map.getLayer("shared-layer"))
            map.setFilter("shared-layer", finalFilter as FilterSpecification);
        if (map.getLayer("shared-geojson-layer"))
            map.setFilter(
                "shared-geojson-layer",
                finalFilter as FilterSpecification,
            );

        popupRef.current?.remove();
    }, [hiddenIncidentIds, activeCategory, isMapLoaded]);

    // Add new live incidents to the map when newLiveIncidents changes
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const source = map.getSource(
            "shared-geojson-source",
        ) as maplibregl.GeoJSONSource;

        if (source) {
            const featureCollection: FeatureCollection = {
                type: "FeatureCollection",
                features: newLiveIncidents.map((inc) => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [inc.longitude, inc.latitude],
                    },
                    properties: {
                        id: inc.id,
                        level: inc.level || "",
                        category: inc.category || "",
                        description: inc.description || "",
                        created_at: inc.timestamp || "",
                        image_urls: "{" + (inc.imageUrls || []).join(",") + "}",
                    },
                })),
            };

            source.setData(featureCollection);
            map.triggerRepaint();
        }
    }, [newLiveIncidents]);

    const handleMapLoad = async (map: maplibregl.Map) => {
        mapRef.current = map;

        if (mode === "location") {
            await Promise.all(
                ICONS_TO_LOAD.map(async (icon) => {
                    try {
                        if (!map.hasImage(icon.name)) {
                            const image = await map.loadImage(icon.url);
                            map.addImage(icon.name, image.data);
                        }
                    } catch (error) {
                        console.warn(
                            `Failed to load icon: ${icon.name}`,
                            error,
                        );
                    }
                }),
            );
        }

        const customSymbolLayout = {
            ...incidentLayerLayout,
            "icon-allow-overlap": true,
            "text-allow-overlap": true,
            "icon-ignore-placement": true,
        };

        if (!map.getSource("shared-source")) {
            map.addSource("shared-source", {
                type: "vector",
                tiles: [tileUrl],
            });
        }

        if (!map.getLayer("shared-layer")) {
            if (mode === "location") {
                map.addLayer({
                    id: "shared-layer",
                    type: "symbol",
                    source: "shared-source",
                    "source-layer": sourceLayerName,
                    layout: customSymbolLayout,
                    paint: incidentLayerPaint,
                } as unknown as SymbolLayerSpecification);
            } else {
                map.addLayer({
                    id: "shared-layer",
                    type: "circle",
                    source: "shared-source",
                    "source-layer": sourceLayerName,
                    paint: {
                        "circle-color": "#ef4444",
                        "circle-radius": 8,
                        "circle-opacity": 0.8,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff",
                        "circle-stroke-opacity": 1,
                    },
                } as unknown as CircleLayerSpecification);
            }
        }

        if (!map.getSource("shared-geojson-source")) {
            map.addSource("shared-geojson-source", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] },
            });
        }

        if (!map.getLayer("shared-geojson-layer")) {
            if (mode === "location") {
                map.addLayer({
                    id: "shared-geojson-layer",
                    type: "symbol",
                    source: "shared-geojson-source",
                    layout: customSymbolLayout,
                    paint: incidentLayerPaint,
                } as unknown as SymbolLayerSpecification);
            } else {
                map.addLayer({
                    id: "shared-geojson-layer",
                    type: "circle",
                    source: "shared-geojson-source",
                    paint: {
                        "circle-color": "#ef4444",
                        "circle-radius": 8,
                        "circle-opacity": 0.8,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff",
                        "circle-stroke-opacity": 1,
                    },
                } as unknown as CircleLayerSpecification);
            }
        }

        if (mode === "processing") {
            let lastRenderTime = 0;
            const FPS = 20;
            const frameInterval = 1000 / FPS;

            const animate = (timestamp: number) => {
                if (!isAnimating.current) return;
                animationId.current = requestAnimationFrame(animate);

                if (timestamp - lastRenderTime < frameInterval) return;
                lastRenderTime = timestamp;

                const pulse = Math.sin(timestamp / 300);
                const opacity = 0.65 + pulse * 0.25;
                const radius = 8 + pulse * 2;

                if (map.getLayer("shared-layer")) {
                    map.setPaintProperty(
                        "shared-layer",
                        "circle-opacity",
                        opacity,
                    );
                    map.setPaintProperty(
                        "shared-layer",
                        "circle-stroke-opacity",
                        opacity,
                    );
                    map.setPaintProperty(
                        "shared-layer",
                        "circle-radius",
                        radius,
                    );
                }
                if (map.getLayer("shared-geojson-layer")) {
                    map.setPaintProperty(
                        "shared-geojson-layer",
                        "circle-opacity",
                        opacity,
                    );
                    map.setPaintProperty(
                        "shared-geojson-layer",
                        "circle-stroke-opacity",
                        opacity,
                    );
                    map.setPaintProperty(
                        "shared-geojson-layer",
                        "circle-radius",
                        radius,
                    );
                }
            };
            animationId.current = requestAnimationFrame(animate);
        }

        const interactiveLayers = ["shared-layer", "shared-geojson-layer"];

        map.on("click", interactiveLayers, (e) => {
            if (!e.features || e.features.length === 0) return;
            const feature = e.features[0];

            let coords: [number, number];
            if (feature.geometry.type === "Point") {
                coords = [
                    feature.geometry.coordinates[0],
                    feature.geometry.coordinates[1],
                ];
            } else {
                coords = [e.lngLat.lng, e.lngLat.lat];
            }

            map.flyTo({
                center: coords,
                zoom: 16,
                speed: 1.2,
                curve: 1.4,
            });

            if (mode === "location") {
                if (onItemClick)
                    onItemClick(String(feature.properties?.id), feature);
                return;
            }

            if (!rootRef.current)
                rootRef.current = createRoot(popupContainerRef.current);
            popupContainerRef.current.style.width = "230px";
            popupRef.current
                .setLngLat(coords)
                .setDOMContent(popupContainerRef.current)
                .addTo(map);

            rootRef.current.render(
                <IncidentPopup
                    key={feature.properties?.id || Math.random()}
                    properties={feature.properties}
                    hideActions={false}
                    onViewDetails={() =>
                        onItemClick &&
                        onItemClick(String(feature.properties?.id), feature)
                    }
                />,
            );
        });

        map.on(
            "mouseenter",
            interactiveLayers,
            () => (map.getCanvas().style.cursor = "pointer"),
        );
        map.on(
            "mouseleave",
            interactiveLayers,
            () => (map.getCanvas().style.cursor = "default"),
        );

        setIsMapLoaded(true);
    };

    return (
        <BaseMap
            className="w-full h-full"
            cursorStyle="default"
            onMapLoad={handleMapLoad}
        />
    );
}
