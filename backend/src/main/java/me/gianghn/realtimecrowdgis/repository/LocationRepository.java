package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {
}
