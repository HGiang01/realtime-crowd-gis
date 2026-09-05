package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.MapDTO;
import me.gianghn.realtimecrowdgis.entity.LocationRevision;
import me.gianghn.realtimecrowdgis.repository.LocationRevisionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationRevisionService {
    private final LocationRevisionRepository locationRevisionRepository;

    public List<LocationRevision> findTop10ByNameAndAddress(String keyword) {
        return locationRevisionRepository.findTop10ByNameAndAddress(keyword);
    }

    public List<MapDTO.LocationHistoricalMatchProjection> findTop10HistoricalByNameAndAddress(String keyword, int depth) {
        return locationRevisionRepository.findTop10HistoricalByNameAndAddress(keyword, depth);
    }
}
