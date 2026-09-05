import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { MAP_BOUNDS, OFFICIAL_PROTOMAPS_STYLE } from "../config/mapConfig";

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

interface BaseMapProps {
    className?: string;
    startingCoordinate?: { lng: number; lat: number } | null;
    externalCoordinate?: { lng: number; lat: number } | null;
    cursorStyle?: "crosshair" | "grab" | "default";
    onMapLoad?: (map: maplibregl.Map) => void;
    showGeolocateControl?: boolean; // prop for controlling the visibility of the GeolocateControl
    children?: React.ReactNode;
}

export default function BaseMap({
    className = "",
    startingCoordinate,
    externalCoordinate,
    cursorStyle = "grab",
    showGeolocateControl = true, // default to true to show the GeolocateControl
    onMapLoad,
    children,
}: BaseMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        const mapConfig: maplibregl.MapOptions = {
            container: mapContainer.current,
            style: OFFICIAL_PROTOMAPS_STYLE,
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

        if (showGeolocateControl) {
            map.current.addControl(
                new maplibregl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true,
                    },
                    trackUserLocation: true,
                }),
                "top-right",
            );
        }

        const resizeObserver = new ResizeObserver(() => map.current?.resize());
        resizeObserver.observe(mapContainer.current);

        map.current.on("load", () => {
            map.current?.resize();
            map.current!.getCanvas().style.cursor = cursorStyle;
            if (onMapLoad) onMapLoad(map.current!);
        });

        return () => {
            resizeObserver.disconnect();
            map.current?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map.current || !externalCoordinate) return;
        const { lng, lat } = externalCoordinate;
        map.current.flyTo({ center: [lng, lat], zoom: 16 });
    }, [externalCoordinate]);

    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            map.current.getCanvas().style.cursor = cursorStyle;
        }
    }, [cursorStyle]);

    return (
        <div className={`relative ${className}`} ref={mapContainer}>
            {children}
        </div>
    );
}
