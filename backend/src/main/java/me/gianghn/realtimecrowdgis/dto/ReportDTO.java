package me.gianghn.realtimecrowdgis.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import me.gianghn.realtimecrowdgis.entity.IncidentReport;
import me.gianghn.realtimecrowdgis.entity.IncidentReportResult;
import me.gianghn.realtimecrowdgis.entity.LocationReport;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReportDTO {
    record GetLocationReportResponse(
            UUID id,
            UUID userId,
            UUID resolverId,
            UUID locationId,
            String name,
            String formattedAddress,
            Double longitude,
            Double latitude,
            LocationReport.Category category,
            String phone,
            String website,
            String operatingHours,
            String googleMapsUrl,
            List<String> imageUrls,
            LocationReport.Status status,
            Instant createdAt) {
    }

    record CreateLocationRequest(
            @NotBlank(message = "Name is required")
            String name,

            @NotBlank(message = "Formatted address is required")
            String formattedAddress,

            @NotNull(message = "Longitude is required")
            Double longitude,

            @NotNull(message = "Latitude is required")
            Double latitude,

            UUID locationId,

            LocationReport.Category category,

            String phone,

            String website,

            String operatingHours,

            String googleMapsUrl,

            List<MultipartFile> files
    ) {
        @JsonIgnore
        @AssertTrue(message = "Invalid coordinate")
        public boolean isInValidCoordinate() {
            if (latitude == null || longitude == null) {
                return true;
            }
            return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
        }
    }

    record UpdateLocationRequest(
            @NotBlank(message = "Location id is required")
            UUID locationId,

            String name,

            String formattedAddress,

            Double longitude,

            Double latitude,

            LocationReport.Category category,

            String phone,

            String website,

            String operatingHours,

            String googleMapsUrl,

            List<MultipartFile> files
    ) {
        @JsonIgnore
        @AssertTrue(message = "Invalid coordinate")
        public boolean isInValidCoordinate() {
            if (latitude == null || longitude == null) {
                return true;
            }
            return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
        }
    }

    record GetIncidentReportResponse(
            UUID id,
            UUID userId,
            UUID resolverId,
            String description,
            IncidentReport.Category category,
            IncidentReport.Status status,
            IncidentReport.Level level,
            Double longitude,
            Double latitude,
            List<String> imageUrls,
            Instant createdAt
    ) {
    }

    record GetLocationReportListResponse(
            UUID id,
            String name,
            String formattedAddress,
            String category,
            LocationReport.Status status,
            Instant createdAt
    ) {
    }

    record GetLocationRevisionResponse(
            UUID id,
            String name,
            String formattedAddress,
            Double longitude,
            Double latitude,
            LocationReport.Category category,
            String phone,
            String website,
            String operatingHours,
            String googleMapsUrl,
            List<String> imageUrls,
            LocationReport.Status status,
            Instant createdAt
    ) {
    }

    record CreateIncidentRequest(
            IncidentReport.Category category,

            IncidentReport.Level level,

            @NotBlank(message = "The description field is required. Please provide a meaningful description for your reports")
            String description,

            @NotNull(message = "At least one image file is required")
            List<MultipartFile> files,

            @NotNull(message = "Longitude is required")
            Double longitude,

            @NotNull(message = "Latitude is required")
            Double latitude
    ) {
        @JsonIgnore
        @AssertTrue(message = "Invalid coordinate")
        public boolean isInValidCoordinate() {
            if (latitude == null || longitude == null) {
                return true;
            }
            return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
        }
    }

    record GetIncidentReportListResponse(
            UUID id,
            IncidentReport.Category category,
            IncidentReport.Level level,
            IncidentReport.Status status,
            String description,
            Instant createdAt) {
    }

    record CreateIncidentResultRequest(
            @NotNull(message = "The status is required")
            IncidentReport.Status status,

            @NotNull(message = "At least one image file is required")
            List<MultipartFile> files,

            @NotBlank(message = "The description field is required. Please provide a meaningful description for your result")
            String description
    ) {
    }

    record UpdateIncidentResultRequest(
            IncidentReport.Status status,
            List<MultipartFile> files,
            String description
    ) {
    }

    record RatingIncidentReportResultRequest(
            @NotNull(message = "Satisfaction rating is required")
            IncidentReportResult.ResultRating satisfactionRating,
            String satisfactionComment
    ) {
    }

    record GetIncidentReportResultResponse(
            String description,
            List<String> imageUrls,
            IncidentReportResult.ResultRating satisfactionRating,
            String satisfactionComment,
            Instant ratedAt,
            Instant updatedAt
    ) {
    }

    record RealtimeIncidentInProgressMessage(
            String id,
            String description,
            double latitude,
            double longitude,
            String category,
            String level,
            List<String> imageUrls,
            long timestamp
    ) {
    }

    record RealtimeIncidentClosedMessage(
            String id
    ) {
    }
}
