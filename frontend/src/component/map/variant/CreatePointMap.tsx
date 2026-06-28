import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import BaseMap from "../core/BaseMap";

interface CreatePointMapProps {
    onLocationSelect: (lng: number, lat: number) => void;
    initialCoordinates?: { lng: number; lat: number } | null;
}

export default function CreatePointMap({
    onLocationSelect,
    initialCoordinates,
}: CreatePointMapProps) {
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

    useEffect(() => {
        return () => {
            if (markerRef.current) markerRef.current.remove();
        };
    }, []);

    useEffect(() => {
        if (!mapInstance || !initialCoordinates) return;

        const { lng, lat } = initialCoordinates;

        if (markerRef.current) {
            markerRef.current.remove();
        }

        const el = document.createElement("div");
        el.className =
            "w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg pointer-events-none";

        markerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(mapInstance);
    }, [mapInstance, initialCoordinates]);

    const handleMapLoad = (map: maplibregl.Map) => {
        setMapInstance(map);

        map.on("click", (e) => {
            const { lng, lat } = e.lngLat;

            if (markerRef.current) markerRef.current.remove();

            const el = document.createElement("div");
            el.className =
                "w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg pointer-events-none";

            markerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map);

            onLocationSelect(lng, lat);
        });
    };

    return (
        <BaseMap
            className="w-full h-full"
            cursorStyle="crosshair"
            onMapLoad={handleMapLoad}
        />
    );
}
