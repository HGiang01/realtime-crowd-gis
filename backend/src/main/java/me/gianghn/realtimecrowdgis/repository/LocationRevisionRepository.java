package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.dto.MapDTO;
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

    @Query(value = """
                WITH ranked_revisions AS (
                    SELECT
                        rev.*,
                        ROW_NUMBER() OVER (PARTITION BY rev.location_id ORDER BY rev.created_at DESC) AS rn,
                        (unaccent(rev.name) ILIKE unaccent(CONCAT('%', :keyword, '%'))
                            OR unaccent(rev.formatted_address) ILIKE unaccent(CONCAT('%', :keyword, '%'))) AS is_match
                    FROM t_location_revisions rev
                ),
                top_n_revisions AS (
                    SELECT * FROM ranked_revisions WHERE rn <= :depth
                ),
                matched_locations AS (
                    SELECT DISTINCT location_id
                    FROM top_n_revisions
                    WHERE is_match = true
                    LIMIT 10
                )
                SELECT t.location_id AS locationId, t.name AS name, t.formatted_address AS formattedAddress, t.rn AS rn, t.is_match AS isMatch
                FROM top_n_revisions t
                INNER JOIN matched_locations m ON m.location_id = t.location_id
                ORDER BY t.location_id, t.rn;
            """, nativeQuery = true)
    List<MapDTO.LocationHistoricalMatchProjection> findTop10HistoricalByNameAndAddress(
      @Param("keyword") String keyword,
      @Param("depth") int depth
    );
}
