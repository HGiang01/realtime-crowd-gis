package me.gianghn.realtimecrowdgis.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.dto.ApiResponse;
import me.gianghn.realtimecrowdgis.dto.MapDTO;
import me.gianghn.realtimecrowdgis.service.MapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
public class MapController {
    private final MapService mapService;

    @GetMapping(value = "/location/{z}/{x}/{y}.pbf", produces = "application/x-protobuf")
    public ResponseEntity<byte[]> getLocationTile(
            @PathVariable("z") int z,
            @PathVariable("x") int x,
            @PathVariable("y") int y
    ) {
        byte[] tileData = mapService.getLocationTile(z, x, y);
        if (tileData != null) {
            return ResponseEntity.ok(tileData);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping(value = "/pending/{z}/{x}/{y}.pbf", produces = "application/x-protobuf")
    public ResponseEntity<byte[]> getPendingTile(
            @PathVariable("z") int z,
            @PathVariable("x") int x,
            @PathVariable("y") int y
    ) {
        byte[] tileData = mapService.getPendingTile(z, x, y);
        if (tileData != null) {
            return ResponseEntity.ok(tileData);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping(value = "/processing/{z}/{x}/{y}.pbf", produces = "application/x-protobuf")
    public ResponseEntity<byte[]> getProcessingTile(
            @PathVariable("z") int z,
            @PathVariable("x") int x,
            @PathVariable("y") int y
    ) {
        byte[] tileData = mapService.getProcessingTile(z, x, y);
        if (tileData != null) {
            return ResponseEntity.ok(tileData);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<MapDTO.GetLocationResponse>> getLocationDetail(@PathVariable("id") UUID id) {
        MapDTO.GetLocationResponse location = mapService.getLocationById(id);
        return ResponseEntity.ok(ApiResponse.success("Get location detail successfully", location));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/locations/{id}/revisions")
    public ResponseEntity<ApiResponse<Set<MapDTO.GetLocationResponse>>> getLocationRevisions(
            @PathVariable("id") UUID id
    ) {
        Set<MapDTO.GetLocationResponse> revisions = mapService.getLocationRevisionsById(id);
        return ResponseEntity.ok(ApiResponse.success("Get location revisions detail successfully", revisions));
    }

    @GetMapping("/locations/search")
    public ResponseEntity<ApiResponse<?>> searchLocationsWithoutPagination(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "depth", required = false) Integer depth
    ) {
        Object searchResults = mapService.searchLocations(keyword, Optional.ofNullable(depth));
        return ResponseEntity.ok(ApiResponse.success("Search locations successfully", searchResults));
    }
}
