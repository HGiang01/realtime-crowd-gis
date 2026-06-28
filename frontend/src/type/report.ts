export type Status = 'pending_review' | 'processing' | 'approved' | 'rejected';

export type IncidentLevel = 'low' | 'medium' | 'high';

export type IncidentRating = 'pending_rating' | 'dissatisfied' | 'acceptable' | 'satisfied';

export type IncidentCategory =
    'infrastructure'
    | 'traffic'
    | 'environment'
    | 'noise'
    | 'security'
    | 'healthy_safety'
    | 'administrative'
    | 'other';

export type LocationCategory =
    'education'
    | 'government'
    | 'landmark'
    | 'market'
    | 'medical'
    | 'museum'
    | 'park'
    | 'police'
    | 'religion'
    | 'restroom'
    | 'tourism'
    | 'other';

export interface Incident {
    id: string;
    userId: string;
    resolverId: string | null;
    description: string;
    imageUrls: File[];
    category: IncidentCategory;
    status: Status;
    level: IncidentLevel;
    latitude: number;
    longitude: number;
    createdAt: string;
}

export interface SpringPage<T> {
    content: T[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    }
}

export type IncidentList = Pick<Incident,
    "id" | "category" | "level" | "status" | "description" | "createdAt">

export interface CreateLocationRequest {
    name: string;
    formattedAddress?: string;
    category?: string;
    phone?: string;
    website?: string;
    openingHours?: string;
    googleMapsUrl?: string;
    lat: number | string;
    lng: number | string;
    files: File[];
}

export interface Location {
    id: string;
    userId: string,
    locationId: string | null;
    resolverId: string | null;
    name: string;
    formattedAddress: string;
    category: LocationCategory;
    phone: string;
    website: string;
    operatingHours: string;
    googleMapsUrl: string;
    longitude: number;
    latitude: number;
    status: Status;
    createdAt: string;
    imageUrls: string[];
}

export type LocationList = Pick<Location, "id" | "name" | "formattedAddress" | "category" | "status" | "createdAt">

export interface IncidentReportResult {
    description: string;
    imageUrls: string[];
    satisfactionRating: IncidentRating;
    satisfactionComment: string;
    ratedAt: string;
    updatedAt: string;
}

export interface LocationRevision {
    id: string;
    name: string;
    formattedAddress: string;
    longitude: number;
    latitude: number;
    category: LocationCategory;
    phone: string;
    website: string;
    operatingHours: string;
    googleMapsUrl: string;
    imageUrls: string[];
    status: Status;
    createdAt: string;
}

export interface SearchLocation {
    locationId: string;
    name: string;
    formattedAddress: string;
}