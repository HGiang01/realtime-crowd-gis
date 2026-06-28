import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import BaseMap from "../core/BaseMap";
import IncidentPopup from "../component/IncidentPopup";

interface LiveIncidentMapProps {
    tileUrl: string;
    sourceLayerName: string;
    type: "processing" | "pending";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onItemClick?: (id: string, featureData: any) => void;
    onClaimSubmit?: (id: string) => Promise<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newLiveIncidents?: any[]; // New incidents received from WebSocket
    hiddenIncidentIds?: string[]; // Hidden IDs received from WebSocket (claimed by other admins)
    activeCategory?: string;
    activeLevel?: string;
}

export default function LiveIncidentMap({
    tileUrl,
    sourceLayerName,
    type,
    onItemClick,
    onClaimSubmit,
    newLiveIncidents = [],
    hiddenIncidentIds = [], //_Default to empty array
    activeCategory,
    activeLevel,
}: LiveIncidentMapProps) {
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

    const [claimedIds, setClaimedIds] = useState<string[]>([]);
    const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

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

    // Filter incidents based on activeCategory, activeLevel, claimedIds, and hiddenIncidentIds
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;
        const map = mapRef.current;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filterExpressions: any[] = ["all"];

        if (activeCategory) {
            filterExpressions.push(["==", ["get", "category"], activeCategory]);
        }

        if (activeLevel) {
            filterExpressions.push(["==", ["get", "level"], activeLevel]);
        }

        const allHiddenIds = [
            ...new Set([...claimedIds, ...hiddenIncidentIds]),
        ];
        allHiddenIds.forEach((id) => {
            filterExpressions.push(["!=", ["get", "id"], id]);
        });

        const finalFilter =
            filterExpressions.length > 1 ? filterExpressions : null;

        if (map.getLayer("live-layer")) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map.setFilter("live-layer", finalFilter as any);
        }
        if (map.getLayer("live-geojson-layer")) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map.setFilter("live-geojson-layer", finalFilter as any);
        }

        popupRef.current?.remove();
    }, [
        activeCategory,
        activeLevel,
        isMapLoaded,
        claimedIds,
        hiddenIncidentIds,
    ]);

    // Convert newLiveIncidents to GeoJSON and update the source data
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const source = map.getSource(
            "live-geojson-source",
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
                        level: inc.level,
                        category: inc.category,
                        description: inc.description,
                        created_at: inc.timestamp,
                        image_urls: "{" + (inc.imageUrls || []).join(",") + "}",
                    },
                })),
            };
            source.setData(featureCollection);
            map.triggerRepaint();
        }
    }, [newLiveIncidents]);

    const handlePopupClaim = async (id: string) => {
        if (!onClaimSubmit || !mapRef.current) return;

        const success = await onClaimSubmit(id);
        if (success) {
            popupRef.current.remove();
            setClaimedIds((prev) => [...prev, id]);

            let features = mapRef.current.querySourceFeatures("live-source", {
                sourceLayer: sourceLayerName,
                filter: ["==", ["get", "id"], id],
            });
            if (features.length === 0) {
                features = mapRef.current.querySourceFeatures(
                    "live-geojson-source",
                    { filter: ["==", ["get", "id"], id] },
                );
            }

            if (features.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const geometry = features[0].geometry as any;
                const coords = [
                    geometry.coordinates[0],
                    geometry.coordinates[1],
                ] as [number, number];

                const el = document.createElement("div");
                el.className =
                    "w-3 h-3 rounded-full bg-gray-400 border-2 border-white animate-pulse shadow-sm";
                new maplibregl.Marker({ element: el })
                    .setLngLat(coords)
                    .addTo(mapRef.current);
            }
        }
    };

    const handleMapLoad = (map: maplibregl.Map) => {
        mapRef.current = map;

        if (!map.getSource("live-source"))
            map.addSource("live-source", { type: "vector", tiles: [tileUrl] });
        if (!map.getLayer("live-layer")) {
            map.addLayer({
                id: "live-layer",
                type: "circle",
                source: "live-source",
                "source-layer": sourceLayerName,
                paint: {
                    "circle-color": "#ef4444",
                    "circle-radius": 8,
                    "circle-opacity": 0.8,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-opacity": 1,
                },
            });
        }

        if (!map.getSource("live-geojson-source")) {
            map.addSource("live-geojson-source", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] },
            });
        }
        if (!map.getLayer("live-geojson-layer")) {
            map.addLayer({
                id: "live-geojson-layer",
                type: "circle",
                source: "live-geojson-source",
                paint: {
                    "circle-color": "#ef4444",
                    "circle-radius": 8,
                    "circle-opacity": 0.8,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-opacity": 1,
                },
            });
        }

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

            if (map.getLayer("live-layer")) {
                map.setPaintProperty("live-layer", "circle-opacity", opacity);
                map.setPaintProperty(
                    "live-layer",
                    "circle-stroke-opacity",
                    opacity,
                );
                map.setPaintProperty("live-layer", "circle-radius", radius);
            }
            if (map.getLayer("live-geojson-layer")) {
                map.setPaintProperty(
                    "live-geojson-layer",
                    "circle-opacity",
                    opacity,
                );
                map.setPaintProperty(
                    "live-geojson-layer",
                    "circle-stroke-opacity",
                    opacity,
                );
                map.setPaintProperty(
                    "live-geojson-layer",
                    "circle-radius",
                    radius,
                );
            }
        };
        animationId.current = requestAnimationFrame(animate);

        const interactiveLayers = ["live-layer", "live-geojson-layer"];
        map.on("click", interactiveLayers, (e) => {
            if (!e.features || e.features.length === 0) return;
            const feature = e.features[0];
            const hideClaimButton = type === "processing";

            if (!rootRef.current)
                rootRef.current = createRoot(popupContainerRef.current);
            popupContainerRef.current.style.width = "230px";
            popupRef.current
                .setLngLat([e.lngLat.lng, e.lngLat.lat])
                .setDOMContent(popupContainerRef.current)
                .addTo(map);

            rootRef.current.render(
                <IncidentPopup
                    key={feature.properties.id}
                    properties={feature.properties}
                    hideActions={hideClaimButton}
                    onClaim={handlePopupClaim}
                    onViewDetails={() =>
                        onItemClick &&
                        onItemClick(feature.properties.id, feature)
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
