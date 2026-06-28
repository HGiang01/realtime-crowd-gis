package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.client.MartinClient;
import me.gianghn.realtimecrowdgis.config.RedisConfig;
import me.gianghn.realtimecrowdgis.dto.MapDTO;
import me.gianghn.realtimecrowdgis.entity.Location;
import me.gianghn.realtimecrowdgis.entity.LocationRevision;
import me.gianghn.realtimecrowdgis.exception.specify.LocationNotFound;
import me.gianghn.realtimecrowdgis.mapper.MapMapper;
import me.gianghn.realtimecrowdgis.repository.LocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
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

    public MapDTO.GetLocationResponse getLocationById(UUID id) {
        Location location = locationRepository.findById(id)
                                              .orElseThrow(() -> new LocationNotFound("Location not found"));
        return mapMapper.toGetLocationResponse(location.getCurrentRevision());
    }

    public Set<MapDTO.GetLocationResponse> getLocationRevisionsById(UUID id) {
        Location location = locationRepository.findById(id)
                                              .orElseThrow(() -> new LocationNotFound("Location not found"));
        return location.getLocationRevisions()
                       .stream()
                       .map(mapMapper::toGetLocationResponse)
                       .collect(Collectors.toSet());
    }

    public List<MapDTO.SearchLocationResponse> searchLocations(String keyword) {
        if (keyword.isBlank()) {
            return null;
        }

        List<LocationRevision> locations = locationRevisionService.findTop10ByNameAndAddress(keyword);
        return locations.stream().map(mapMapper::toSearchLocationResponse).toList();
    }
}
