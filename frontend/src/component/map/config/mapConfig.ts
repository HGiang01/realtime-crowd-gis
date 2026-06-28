import maplibregl from "maplibre-gl";
import { layers, namedFlavor } from "@protomaps/basemaps";

export const MAP_BOUNDS: [number, number, number, number] = [
    106.684456, 10.73179, 106.89045, 10.921472,
];

export const ICONS_TO_LOAD = [
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

export const OFFICIAL_PROTOMAPS_STYLE: maplibregl.StyleSpecification = {
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {
        protomaps: {
            type: "vector",
            url: `pmtiles://${window.location.origin}/thu_duc_city.pmtiles`,
            attribution: '<a href="https://protomaps.com">Protomaps</a>',
        },
    },
    // Add configuration from @protomaps/basemaps 
    layers: layers("protomaps", namedFlavor("light"), { lang: "vi" }),
};