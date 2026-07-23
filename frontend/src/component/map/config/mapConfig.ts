import maplibregl from "maplibre-gl";
import { layers, namedFlavor } from "@protomaps/basemaps";

export const MAP_BOUNDS: [number, number, number, number] = [
    106.684456, 10.73179, 106.89045, 10.921472,
];

export const ICONS_TO_LOAD = [
    { name: "poi-education", url: "/icons/poi-education.png" },
    { name: "poi-government", url: "/icons/poi-government.png" },
    { name: "poi-landmark", url: "/icons/poi-landmark.png" },
    { name: "poi-market", url: "/icons/poi-market.png" },
    { name: "poi-medical", url: "/icons/poi-medical.png" },
    { name: "poi-museum", url: "/icons/poi-museum.png" },
    { name: "poi-other", url: "/icons/poi-other.png" },
    { name: "poi-park", url: "/icons/poi-park.png" },
    { name: "poi-police", url: "/icons/poi-police.png" },
    { name: "poi-religion", url: "/icons/poi-religion.png" },
    { name: "poi-restroom", url: "/icons/poi-restroom.png" },
    { name: "poi-tourism", url: "/icons/poi-tourism.png" },
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