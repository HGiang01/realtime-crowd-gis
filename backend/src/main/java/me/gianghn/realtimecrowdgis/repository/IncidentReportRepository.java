package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.IncidentReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, UUID> {
    @Query(value = """
            SELECT *
            FROM t_incident_reports
            WHERE user_id = :userId
                AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS report_status))
                AND (CAST(:level AS varchar) IS NULL OR level = CAST(:level AS level))
                AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS incident_report_category))
                AND (CAST(:keyword AS varchar) IS NULL OR description ILIKE CONCAT('%', :keyword, '%') OR CAST(id AS varchar) ILIKE CONCAT('%', :keyword, '%'))
            """,
           countQuery = """
                    SELECT COUNT(*)
                    FROM t_incident_reports
                    WHERE user_id = :userId
                       AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS report_status))
                       AND (CAST(:level AS varchar) IS NULL OR level = CAST(:level AS level))
                       AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS incident_report_category))
                       AND (CAST(:keyword AS varchar) IS NULL OR description ILIKE CONCAT('%', :keyword, '%') OR CAST(id AS varchar) ILIKE CONCAT('%', :keyword, '%'))
                   """,
           nativeQuery = true)
    Page<IncidentReport> getIncidentReportsByUserId(
            @Param("userId") UUID userId,
            @Param("status") String status,
            @Param("level") String level,
            @Param("category") String category,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query(value = """
            SELECT *
            FROM t_incident_reports
            WHERE resolver_id = :adminId
                AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS report_status))
                AND (CAST(:level AS varchar) IS NULL OR level = CAST(:level AS level))
                AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS incident_report_category))
                AND (CAST(:keyword AS varchar) IS NULL OR description ILIKE CONCAT('%', :keyword, '%') OR CAST(id AS varchar) ILIKE CONCAT('%', :keyword, '%'))
            """,
           countQuery = """
                    SELECT COUNT(*)
                    FROM t_incident_reports
                    WHERE resolver_id = :adminId
                       AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS report_status))
                       AND (CAST(:level AS varchar) IS NULL OR level = CAST(:level AS level))
                       AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS incident_report_category))
                       AND (CAST(:keyword AS varchar) IS NULL OR description ILIKE CONCAT('%', :keyword, '%') OR CAST(id AS varchar) ILIKE CONCAT('%', :keyword, '%'))
                   """,
           nativeQuery = true)
    Page<IncidentReport> getIncidentReportsByAdminId(
            @Param("adminId") UUID adminId,
            @Param("status") String status,
            @Param("level") String level,
            @Param("category") String category,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
