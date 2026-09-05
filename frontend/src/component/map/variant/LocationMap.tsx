import { useRef } from "react";
import { createRoot } from "react-dom/client";
import maplibregl from "maplibre-gl";
import BaseMap from "../core/BaseMap";
import { ICONS_TO_LOAD } from "../config/mapConfig";
import { incidentLayerLayout, incidentLayerPaint } from "../config/layerStyles";
import IncidentPopup from "../component/IncidentPopup";

interface LocationMapProps {
    tileUrl: string;
    sourceLayerName: string;
    onItemClick?: (id: string, featureData: any) => void;
}

export default function LocationMap({ tileUrl, sourceLayerName, onItemClick }: LocationMapProps) {
    const popupRef = useRef<maplibregl.Popup>(new maplibregl.Popup({ closeOnClick: false }));
    const popupContainerRef = useRef<HTMLDivElement>(document.createElement("div"));

    const handleMapLoad = async (map: maplibregl.Map) => {
        await Promise.all(ICONS_TO_LOAD.map(async (icon) => {
            try {
                if (!map.hasImage(icon.name)) {
                    const image = await map.loadImage(icon.url);
                    map.addImage(icon.name, image.data);
                }
            } catch (err) {}
        }));

        if (!map.getSource("location-source")) {
            map.addSource("location-source", { type: "vector", tiles: [tileUrl] });
        }
        if (!map.getLayer("location-layer")) {
            map.addLayer({
                id: "location-layer",
                type: "symbol",
                source: "location-source",
                "source-layer": sourceLayerName,
                layout: incidentLayerLayout as any,
                paint: incidentLayerPaint as any,
            });
        }

        map.on("click", "location-layer", (e) => {
            if (!e.features || e.features.length === 0) return;
            const feature = e.features[0];
            const coordinates = (feature.geometry as any).coordinates.slice();

            // Render React Component into Popup
            const root = createRoot(popupContainerRef.current);
            root.render(
                <IncidentPopup
                    properties={feature.properties}
                    hideActions={true}
                    onViewDetails={() => onItemClick && onItemClick(feature.properties.id, feature)}
                />
            );

            popupRef.current.setLngLat(coordinates).setDOMContent(popupContainerRef.current).addTo(map);
            if (onItemClick) onItemClick(feature.properties.id, feature);
        });

        map.on("mouseenter", "location-layer", () => map.getCanvas().style.cursor = "pointer");
        map.on("mouseleave", "location-layer", () => map.getCanvas().style.cursor = "default");
    };

    return <BaseMap className="w-full h-full" cursorStyle="default" onMapLoad={handleMapLoad} />;
}