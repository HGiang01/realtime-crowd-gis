package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.client.MartinClient;
import me.gianghn.realtimecrowdgis.config.RedisConfig;
import me.gianghn.realtimecrowdgis.dto.MapDTO.GetLocationResponse;
import me.gianghn.realtimecrowdgis.dto.MapDTO.LocationHistoricalMatchProjection;
import me.gianghn.realtimecrowdgis.dto.MapDTO.SearchLocationResponse;
import me.gianghn.realtimecrowdgis.dto.MapDTO.SearchLocationWithHistoryResponse;
import me.gianghn.realtimecrowdgis.entity.Location;
import me.gianghn.realtimecrowdgis.entity.LocationRevision;
import me.gianghn.realtimecrowdgis.exception.specify.LocationNotFound;
import me.gianghn.realtimecrowdgis.mapper.MapMapper;
import me.gianghn.realtimecrowdgis.repository.LocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapService {
    private final RedisService redisService;
    private final MartinClient martinClient;
    private final LocationRepository locationRepository;
    private final LocationRevisionService locationRevisionService;
    private final MapMapper mapMapper;

    public byte[] getLocationTile(int z, int x, int y) {
        String cacheKey = RedisConfig.genTileKey("location", z, x, y);

        byte[] cachedTile = redisService.getBytes(cacheKey);
        if (cachedTile != null) {
            return cachedTile;
        }

        ResponseEntity<byte[]> response = martinClient.getLocationTile(z, x, y);
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            byte[] tileData = response.getBody();
            redisService.setBytes(cacheKey, tileData, 1, TimeUnit.HOURS);
            return tileData;
        }

        return null;
    }

    public byte[] getPendingTile(int z, int x, int y) {
        String cacheKey = RedisConfig.genTileKey("pending", z, x, y);

        byte[] cachedTile = redisService.getBytes(cacheKey);
        if (cachedTile != null) {
            return cachedTile;
        }

        ResponseEntity<byte[]> response = martinClient.getPendingTile(z, x, y);
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            byte[] tileData = response.getBody();
            redisService.setBytes(cacheKey, tileData, 1, TimeUnit.HOURS);
            return tileData;
        }

        return null;
    }

    public byte[] getProcessingTile(int z, int x, int y) {
        String cacheKey = RedisConfig.genTileKey("processing", z, x, y);

        byte[] cachedTile = redisService.getBytes(cacheKey);
        if (cachedTile != null) {
            return cachedTile;
        }

        ResponseEntity<byte[]> response = martinClient.getProcessingTile(z, x, y);
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            byte[] tileData = response.getBody();
            redisService.setBytes(cacheKey, tileData, 1, TimeUnit.HOURS);
            return tileData;
        }

        return null;
    }

    public GetLocationResponse getLocationById(UUID id) {
        Location location = locationRepository.findById(id)
                                              .orElseThrow(() -> new LocationNotFound("Location not found"));
        return mapMapper.toGetLocationResponse(location.getCurrentRevision());
    }

    public Set<GetLocationResponse> getLocationRevisionsById(UUID id) {
        Location location = locationRepository.findById(id)
                                              .orElseThrow(() -> new LocationNotFound("Location not found"));
        return location.getLocationRevisions()
                       .stream()
                       .map(mapMapper::toGetLocationResponse)
                       .collect(Collectors.toSet());
    }

    public Object searchLocations(String keyword, Optional<Integer> depth) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        if (depth.isPresent()) {
            return searchHistorical(keyword, depth.get());
        } else {
            return searchCurrent(keyword);
        }
    }

    private List<SearchLocationResponse> searchCurrent(String keyword) {
        List<LocationRevision> locations =
                locationRevisionService.findTop10ByNameAndAddress(keyword);

        return locations.stream()
                        .map(mapMapper::toSearchLocationResponse)
                        .toList();
    }

    private List<SearchLocationWithHistoryResponse> searchHistorical(String keyword, int depth) {
        List<LocationHistoricalMatchProjection> revisions = locationRevisionService.findTop10HistoricalByNameAndAddress(
                keyword,
                depth + 1
        );

        Map<UUID, List<LocationHistoricalMatchProjection>> locations = revisions.stream()
                                                                                .collect(Collectors.groupingBy(
                                                                                        LocationHistoricalMatchProjection::getLocationId,
                                                                                        LinkedHashMap::new,
                                                                                        Collectors.toList()
                                                                                ));

        return locations.entrySet().stream()
                        .map(entry -> buildSearchHistoricalLocationResponse(entry.getKey(), entry.getValue()))
                        .toList();
    }

    private SearchLocationWithHistoryResponse buildSearchHistoricalLocationResponse(
            UUID locationId,
            List<LocationHistoricalMatchProjection> revisions
    ) {
        LocationHistoricalMatchProjection current = revisions.stream()
                                                             .filter(r -> r.getRn() == 1)
                                                             .findFirst()
                                                             .orElse(revisions.getFirst());

        List<LocationHistoricalMatchProjection> historicalRows = revisions.stream()
                                                                          .filter(r -> r.getRn() > 1 && Boolean.TRUE.equals(
                                                                                  r.getIsMatch()))
                                                                          .toList();

        List<SearchLocationWithHistoryResponse.HistoricalMatch> historicalMatches =
                mapMapper.toHistoricalMatchInfoList(historicalRows);

        return new SearchLocationWithHistoryResponse(
                locationId,
                current.getName(),
                current.getFormattedAddress(),
                historicalMatches
        );
    }
}
