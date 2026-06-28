package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.LocationReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface LocationReportRepository extends JpaRepository<LocationReport, UUID> {
    Optional<LocationReport> getLocationReportById(UUID id);

    @Query(value = """
             SELECT *
             FROM t_location_reports
             WHERE status = 'pending_review'
                 AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS location_report_category))
                 AND (CAST(:keyword AS varchar) IS NULL
                     OR CAST(id AS VARCHAR) ILIKE CONCAT('%', :keyword, '%')
                     OR name ILIKE CONCAT('%', :keyword, '%')
                     OR formatted_address ILIKE CONCAT('%', :keyword, '%'))
            """,
           countQuery = """
                    SELECT COUNT(*)
                    FROM t_location_reports
                    WHERE status = 'pending_review'
                        AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS location_report_category))
                        AND (CAST(:keyword AS varchar) IS NULL
                            OR CAST(id AS VARCHAR) ILIKE CONCAT('%', :keyword, '%')
                            OR name ILIKE CONCAT('%', :keyword, '%')
                            OR formatted_address ILIKE CONCAT('%', :keyword, '%'))
                   """,
           nativeQuery = true)
    Page<LocationReport> getPendingLocationReports(
            @Param("keyword") String keyword,
            @Param("category") String category,
            Pageable pageable
    );

    @Query(value = """
             SELECT *
             FROM t_location_reports
             WHERE user_id = :userId
                 AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS report_status))
                 AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS location_report_category))
                 AND (CAST(:keyword AS varchar) IS NULL
                     OR CAST(id AS VARCHAR) ILIKE CONCAT('%', :keyword, '%')
                     OR name ILIKE CONCAT('%', :keyword, '%')
                     OR formatted_address ILIKE CONCAT('%', :keyword, '%'))
            """,
           countQuery = """
                    SELECT COUNT(*)
                    FROM t_location_reports
                    WHERE user_id = :userId
                        AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS report_status))
                        AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS location_report_category))
                        AND (CAST(:keyword AS varchar) IS NULL
                            OR CAST(id AS VARCHAR) ILIKE CONCAT('%', :keyword, '%')
                            OR name ILIKE CONCAT('%', :keyword, '%')
                            OR formatted_address ILIKE CONCAT('%', :keyword, '%'))
                   """,
           nativeQuery = true)
    Page<LocationReport> getLocationReportsByUserId(
            @Param("userId") UUID userId,
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("status") String status,
            Pageable pageable
    );

    @Query(value = """
             SELECT *
             FROM t_location_reports
             WHERE resolver_id = :adminId
                 AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS report_status))
                 AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS location_report_category))
                 AND (CAST(:keyword AS varchar) IS NULL
                     OR CAST(id AS VARCHAR) ILIKE CONCAT('%', :keyword, '%')
                     OR name ILIKE CONCAT('%', :keyword, '%')
                     OR formatted_address ILIKE CONCAT('%', :keyword, '%'))
            """,
           countQuery = """
                    SELECT COUNT(*)
                    FROM t_location_reports
                    WHERE resolver_id = :adminId
                        AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS location_report_category))
                        AND (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS location_report_category))
                        AND (CAST(:keyword AS varchar) IS NULL
                            OR CAST(id AS VARCHAR) ILIKE CONCAT('%', :keyword, '%')
                            OR name ILIKE CONCAT('%', :keyword, '%')
                            OR formatted_address ILIKE CONCAT('%', :keyword, '%'))
                   """,
           nativeQuery = true)
    Page<LocationReport> getLocationReportsByAdminId(
            @Param("adminId") UUID adminId,
            @Param("status") String status,
            @Param("category") String category,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
