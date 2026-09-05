package me.gianghn.realtimecrowdgis.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.ApiResponse;
import me.gianghn.realtimecrowdgis.dto.ReportDTO;
import me.gianghn.realtimecrowdgis.dto.ReportDTO.*;
import me.gianghn.realtimecrowdgis.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService service;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/reports/me/locations")
    public ResponseEntity<ApiResponse<Page<GetLocationReportListResponse>>> getMyLocationReports(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "category", required = false) String category,
            @PageableDefault(page = 0, size = 20, sort = "created_at", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<GetLocationReportListResponse> locationReports = service.getLocationReportsByUserId(
                userId,
                keyword,
                status,
                category,
                pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Get user location reports successfully", locationReports));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/reports/me/incidents")
    public ResponseEntity<ApiResponse<Page<GetIncidentReportListResponse>>> getMyIncidentReports(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword,
            @PageableDefault(page = 0, size = 20, sort = "created_at", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<GetIncidentReportListResponse> incidentReports = service.getIncidentReportsByUserId(
                userId,
                status,
                level,
                category,
                keyword,
                pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Get incident reports successfully", incidentReports));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/reports/locations/{id}")
    public ResponseEntity<ApiResponse<GetLocationReportResponse>> getLocationReportDetail(
            @AuthenticationPrincipal UUID userId,
            @PathVariable("id") UUID id
    ) {
        GetLocationReportResponse locationReport = service.getLocationReportByIdAndUserId(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Get user location report successfully", locationReport));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/reports/incidents/{id}")
    public ResponseEntity<ApiResponse<GetIncidentReportResponse>> getIncidentReportDetail(
            @AuthenticationPrincipal UUID userId,
            @PathVariable("id") UUID id
    ) {
        GetIncidentReportResponse incidentReport = service.getIncidentReportByIdAndUserId(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Get incident report successfully", incidentReport));
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping(path = "/reports/locations", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createLocationReport(
            @AuthenticationPrincipal UUID userId,
            @Valid @ModelAttribute CreateLocationRequest request
    ) {
        service.createLocationReport(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.success("Location report created successfully"));
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping(path = "/reports/locations/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateLocationReport(
            @AuthenticationPrincipal UUID userId,
            @ModelAttribute UpdateLocationRequest request
    ) {
        service.updateLocationReport(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.success("Location report created successfully"));
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping(path = "/reports/incidents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createIncidentReport(
            @AuthenticationPrincipal UUID userId,
            @Valid @ModelAttribute CreateIncidentRequest request
    ) {
        service.createIncidentReport(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.success("Location report created successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/reports/locations/pending")
    public ResponseEntity<ApiResponse<Page<GetLocationReportListResponse>>> getPendingIncidentReports(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String category,
            @PageableDefault(page = 0, size = 20, sort = "created_at", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<GetLocationReportListResponse> pendingReports = service.getPendingLocationReports(keyword,
                                                                                               category,
                                                                                               pageable);
        return ResponseEntity.ok(ApiResponse.success("Get pending location reports successfully", pendingReports));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/reports/locations/my-tasks")
    public ResponseEntity<ApiResponse<Page<GetLocationReportListResponse>>> getMyAssignedLocationReports(
            @AuthenticationPrincipal UUID adminId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword,
            @PageableDefault(page = 0, size = 20, sort = "created_at", direction = Sort.Direction.DESC)
            Pageable pageable

    ) {
        Page<GetLocationReportListResponse> reports = service.getLocationReportsByAdminId(adminId,
                                                                                          status,
                                                                                          category,
                                                                                          keyword,
                                                                                          pageable);
        return ResponseEntity.ok(ApiResponse.success("Get assigned location reports successfully", reports));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/reports/incidents/my-tasks")
    public ResponseEntity<ApiResponse<Page<GetIncidentReportListResponse>>> getMyAssignedIncidentReports(
            @AuthenticationPrincipal UUID adminId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword,
            @PageableDefault(page = 0, size = 20, sort = "created_at", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<GetIncidentReportListResponse> reports = service.getIncidentReportsByAdminId(adminId,
                                                                                          status,
                                                                                          level,
                                                                                          category,
                                                                                          keyword,
                                                                                          pageable);
        return ResponseEntity.ok(ApiResponse.success("Get assigned incident reports successfully", reports));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/reports/locations/{id}")
    public ResponseEntity<ApiResponse<GetLocationReportResponse>> getAdminLocationReportDetail(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id
    ) {
        GetLocationReportResponse report = service.getLocationReportByIdAndAdminId(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Get location report successfully", report));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/reports/incidents/{id}")
    public ResponseEntity<ApiResponse<GetIncidentReportResponse>> getAdminIncidentReportDetail(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id
    ) {
        GetIncidentReportResponse report = service.getIncidentReportByIdAndAdminId(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Get incident report successfully", report));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/reports/locations/{id}/assign")
    public ResponseEntity<ApiResponse<Void>> assignLocationReport(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id
    ) {
        service.assignLocationReport(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Location report assigned successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/reports/incidents/{id}/assign")
    public ResponseEntity<ApiResponse<Void>> assignIncidentReport(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id
    ) {
        service.assignIncidentReport(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Incident report assigned successfully", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/reports/locations/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveLocationReport(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id
    ) {
        service.approveLocationReport(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Location report approved successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/reports/locations/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectLocationReport(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id
    ) {
        service.rejectLocationReport(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Location report rejected successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/reports/locations/{id}/revisions")
    public ResponseEntity<ApiResponse<List<GetLocationRevisionResponse>>> getLocationRevisions(
            @PathVariable("id") UUID id
    ) {
        List<GetLocationRevisionResponse> revisions = service.getRevisionsByLocationReportId(id);
        return ResponseEntity.ok(ApiResponse.success("Get location revisions successfully", revisions));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/admin/reports/incidents/{id}/result", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createIncidentResult(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id,
            @Valid @ModelAttribute CreateIncidentResultRequest request
    ) {
        service.createIncidentReportResult(id, adminId, request);
        return ResponseEntity.ok(ApiResponse.success("Create incident report result successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(value = "/admin/reports/incidents/{id}/result", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateIncidentResult(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable("id") UUID id,
            @ModelAttribute UpdateIncidentResultRequest request
    ) {
        service.updateIncidentReportResult(id, adminId, request);
        return ResponseEntity.ok(ApiResponse.success("Update incident report result successfully", null));
    }

    @GetMapping("/reports/incidents/{id}/result")
    public ResponseEntity<ApiResponse<GetIncidentReportResultResponse>> getIncidentResult(
            @AuthenticationPrincipal UUID id,
            @PathVariable("id") UUID reportId
    ) {
        GetIncidentReportResultResponse result = service.getIncidentResult(reportId, id);
        return ResponseEntity.ok(ApiResponse.success("Get incident result successfully", result));
    }

    @PreAuthorize("hasRole('USER')")
    @PatchMapping("/reports/incidents/{id}/result/rating")
    public ResponseEntity<ApiResponse<Void>> ratingIncidentResult(
            @AuthenticationPrincipal UUID userId,
            @PathVariable("id") UUID id,
            @Valid @RequestBody ReportDTO.RatingIncidentReportResultRequest request
    ) {
        service.ratingIncidentResult(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Rating incident result successfully"));
    }
}
