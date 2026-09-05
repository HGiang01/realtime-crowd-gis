package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.IncidentReportResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface IncidentReportResultRepository extends JpaRepository<IncidentReportResult, UUID> {
    @Query("select irr from IncidentReportResult irr where irr.incidentReport.id = :reportId")
    Optional<IncidentReportResult> findByReportId(@Param("reportId") UUID reportId);

    @Query("select irr from IncidentReportResult irr where irr.resolver.id = :resolverId")
    Optional<IncidentReportResult> findByResolverId(@Param("resolverId") UUID resolverId);

    @Query("select irr from IncidentReportResult irr where irr.incidentReport.id = :reportId and irr.resolver.id = :resolverId")
    Optional<IncidentReportResult> findByReportIdAndResolverId(@Param("reportId") UUID reportId, @Param("resolverId") UUID resolverId);
}
