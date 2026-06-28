package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.LocationRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LocationRevisionRepository extends JpaRepository<LocationRevision, UUID> {
    @Query(value = """
                SELECT r.*
                FROM t_location_revisions r
                INNER JOIN t_locations l ON r.id = l.current_revision_id
                WHERE (unaccent(r.name) ILIKE unaccent(CONCAT('%', :keyword, '%'))
                    OR unaccent(r.formatted_address) ILIKE unaccent(CONCAT('%', :keyword, '%')))
                LIMIT 10
            """, nativeQuery = true)
    List<LocationRevision> findTop10ByNameAndAddress(
            @Param("keyword") String keyword
    );
}
