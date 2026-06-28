package me.gianghn.realtimecrowdgis.mapper;

import me.gianghn.realtimecrowdgis.dto.MapDTO;
import me.gianghn.realtimecrowdgis.dto.ReportDTO;
import me.gianghn.realtimecrowdgis.entity.IncidentReport;
import me.gianghn.realtimecrowdgis.entity.IncidentReportResult;
import me.gianghn.realtimecrowdgis.entity.LocationReport;
import me.gianghn.realtimecrowdgis.entity.LocationRevision;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReportMapper {
    GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    // Location
    @Mapping(target = "longitude", source = "geomPoint.x")
    @Mapping(target = "latitude", source = "geomPoint.y")
    ReportDTO.GetLocationRevisionResponse toLocationRevisionResponse(LocationRevision locationRevision);

    @Mapping(target = "id", ignore = true)
    LocationReport createFromLocation(MapDTO.GetLocationResponse location);

    @Mapping(target = "id", ignore = true)
    void updateFromRequest(ReportDTO.UpdateLocationRequest request, @MappingTarget LocationReport report);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    LocationRevision toLocationRevision(LocationReport report);

    @Mapping(target = "longitude", source = "geomPoint.x")
    @Mapping(target = "latitude", source = "geomPoint.y")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "resolverId", source = "resolver.id")
    ReportDTO.GetLocationReportResponse toLocationReportResponse(LocationReport locationReport);

    ReportDTO.GetLocationReportListResponse toLocationReportListResponse(LocationReport locationReport);

    @Mapping(target = "category", defaultValue = "other")
    @Mapping(target = "geomPoint", expression = "java(createPoint(dto.longitude(), dto.latitude()))")
    LocationReport toLocationReport(ReportDTO.CreateLocationRequest dto);

    // Incident
    ReportDTO.GetIncidentReportResultResponse toIncidentReportResultResponse(IncidentReportResult incidentReportResult);

    @Mapping(target = "longitude", source = "geomPoint.x")
    @Mapping(target = "latitude", source = "geomPoint.y")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "resolverId", source = "resolver.id")
    ReportDTO.GetIncidentReportResponse toIncidentReportResponse(IncidentReport incidentReport);

    ReportDTO.GetIncidentReportListResponse toIncidentReportListResponse(IncidentReport incidentReport);

    @Mapping(target = "geomPoint", expression = "java(createPoint(dto.longitude(), dto.latitude()))")
    IncidentReport toIncidentReport(ReportDTO.CreateIncidentRequest dto);

    default Point createPoint(Double longitude, Double latitude) {
        if (longitude == null || latitude == null) {
            return null;
        }
        return GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, latitude));
    }
}