package me.gianghn.realtimecrowdgis.dto;

import me.gianghn.realtimecrowdgis.entity.LocationReport;

import java.util.List;
import java.util.UUID;

public interface MapDTO {
    record GetLocationResponse(
            UUID locationId,
            String name,
            String formattedAddress,
            LocationReport.Category category,
            Double latitude,
            Double longitude,
            String phone,
            String website,
            String operatingHours,
            String googleMapsUrl,
            List<String> imageUrls
    ) {
    }

    record SearchLocationResponse(
            UUID locationId,
            String name,
            String formattedAddress
    ) {
    }

    record SearchLocationWithHistoryResponse(
            UUID locationId,
            String name,
            String formattedAddress,
            List<HistoricalMatch> historicalMatches
    ) {
        public record HistoricalMatch(
                String name,
                String formattedAddress
        ) {
        }
    }

    public interface LocationHistoricalMatchProjection {
        UUID getLocationId();

        String getName();

        String getFormattedAddress();

        Integer getRn();

        Boolean getIsMatch();
    }
}
