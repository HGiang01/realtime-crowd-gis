package me.gianghn.realtimecrowdgis.mapper;

import me.gianghn.realtimecrowdgis.dto.MapDTO;
import me.gianghn.realtimecrowdgis.entity.LocationRevision;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapMapper {
    @Mapping(source = "location.id", target = "locationId")
    @Mapping(target = "longitude", source = "geomPoint.x")
    @Mapping(target = "latitude", source = "geomPoint.y")
    MapDTO.GetLocationResponse toGetLocationResponse(LocationRevision locationRevision);

    @Mapping(source = "location.id", target = "locationId")
    MapDTO.SearchLocationResponse toSearchLocationResponse(LocationRevision locationRevision);
}
