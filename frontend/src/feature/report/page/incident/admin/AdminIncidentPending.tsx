import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, LiveIncidentMap } from "@/component";
import { useStompSubscription } from "@/hook/useStompSubscription";
import { formatTitleCase } from "@/util";
import { useIncidentReportAdminStore } from "@/store";

const INCIDENT_LEVEL_OPTIONS: string[] = ["low", "medium", "high"];
const INCIDENT_CATEGORY_OPTIONS: string[] = [
    "infrastructure",
    "traffic",
    "environment",
    "noise",
    "security",
    "healthy_safety",
    "administrative",
    "other",
];

export interface RealtimeIncidentMessage {
    id: string;
    description: string;
    latitude: number;
    longitude: number;
    category: string;
    level: string;
    imageUrls: string[];
    timestamp: string;
}

export default function AdminIncidentPending() {
    const navigate = useNavigate();
    const { assignReport } = useIncidentReportAdminStore();

    const [activeLevel, setActiveLevel] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState<string>("");

    // Add state to track live incidents and others' claimed incidents
    const [liveIncidents, setLiveIncidents] = useState<
        RealtimeIncidentMessage[]
    >([]);

    // Add state to track incidents claimed by other admins
    const [othersClaimedIds, setOthersClaimedIds] = useState<string[]>([]);

    // Listen for real-time updates on pending incidents
    useStompSubscription<RealtimeIncidentMessage>(
        "/topic/pending-incident-reports",
        (message) => {
            console.log("New incident report received!", message);
            setLiveIncidents((prev) => [...prev, message]);
        },
    );

    // Listen for real-time updates on incidents claimed by other admins
    useStompSubscription<RealtimeIncidentMessage>(
        "/topic/processing-incident-reports",
        (message) => {
            console.log("Incident claimed by another admin:", message.id);
            setOthersClaimedIds((prev) => [...prev, message.id]);
        },
    );

    const handleClaim = async (id: string) => {
        return assignReport(id);
    };

    const handleViewDetails = (id: string) => {
        navigate(`/admin/incident-reports/${id}/review`);
    };

    const mapComponent = useMemo(
        () => (
            <LiveIncidentMap
                key="pending"
                type="pending"
                tileUrl={import.meta.env.VITE_API_PENDING_INCIDENT_URL}
                sourceLayerName={
                    import.meta.env.VITE_API_PENDING_INCIDENT_LAYER_NAME
                }
                onClaimSubmit={handleClaim}
                onItemClick={handleViewDetails}
                newLiveIncidents={liveIncidents}
                hiddenIncidentIds={othersClaimedIds}
                activeCategory={activeCategory}
                activeLevel={activeLevel}
            />
        ),
        [liveIncidents, othersClaimedIds, activeCategory, activeLevel],
    );

    return (
        <div className="flex flex-col relative h-screen overflow-hidden bg-wg-background text-on-wg-background">
            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl" />

            <Header />

            <main className="flex-1 flex flex-col z-10 w-full mx-auto h-full px-8 py-4 min-h-0">
                <section>
                    <h1 className="text-2xl font-bold text-center">
                        Real-Time Incident Map
                    </h1>
                </section>

                <section
                    className="flex-1 flex flex-col gap-8 min-h-0"
                    style={{ animationDelay: "360ms" }}
                >
                    <div className="flex-4 flex relative min-h-0 w-full rounded-xl border border-wg-outline-variant">
                        {mapComponent}

                        <div className="absolute top-4 left-0 right-0 z-[1000] px-12 pointer-events-none">
                            <div className="flex gap-2 overflow-x-auto justify-start md:justify-center items-center pb-2 pointer-events-auto hide-scrollbar">
                                {INCIDENT_LEVEL_OPTIONS.map((level) => {
                                    const isActive = activeLevel === level;
                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() =>
                                                setActiveLevel(
                                                    isActive ? "" : level,
                                                )
                                            }
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm cursor-pointer border ${isActive ? "bg-blue-500 text-white border-transparent" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}
                                        >
                                            {formatTitleCase(level)}
                                        </button>
                                    );
                                })}

                                <div className="w-px h-5 bg-gray-400/50 mx-1 shrink-0"></div>

                                {INCIDENT_CATEGORY_OPTIONS.map((category) => {
                                    const isActive =
                                        activeCategory === category;
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() =>
                                                setActiveCategory(
                                                    isActive ? "" : category,
                                                )
                                            }
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm cursor-pointer border ${isActive ? "bg-blue-500 text-white border-transparent" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}
                                        >
                                            {formatTitleCase(category)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
