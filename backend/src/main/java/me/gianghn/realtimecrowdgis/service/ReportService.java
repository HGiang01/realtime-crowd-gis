package me.gianghn.realtimecrowdgis.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.MapDTO;
import me.gianghn.realtimecrowdgis.dto.ReportDTO;
import me.gianghn.realtimecrowdgis.entity.*;
import me.gianghn.realtimecrowdgis.event.IncidentReportClosedEvent;
import me.gianghn.realtimecrowdgis.event.IncidentReportInProgressEvent;
import me.gianghn.realtimecrowdgis.exception.specify.*;
import me.gianghn.realtimecrowdgis.kafka.producer.IncidentEventProducer;
import me.gianghn.realtimecrowdgis.mapper.ReportMapper;
import me.gianghn.realtimecrowdgis.repository.*;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final RedisService redisService;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final IncidentEventProducer incidentEventProducer;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ContentFilterService contentFilterService;
    private final ReportMapper reportMapper;
    private final LocationRepository locationRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final IncidentReportResultService incidentReportResultService;
    private final LocationReportRepository locationReportRepository;
    private final IncidentReportResultRepository incidentReportResultRepository;
    private final LocationRevisionRepository locationRevisionRepository;

    private final String LOCATION_FOLDER_NAME = "report/location";
    private final String INCIDENT_FOLDER_NAME = "report/incident";
    private final String INCIDENT_RESULT_FOLDER_NAME = "report/incident/result";
    private final int MAX_PAGE_SIZE = 20;
    private final MapService mapService;

    public Page<ReportDTO.GetIncidentReportListResponse> getIncidentReportsByUserId(
            UUID userId,
            String status,
            String level,
            String category,
            String keyword,
            Pageable pageable
    ) {
        pageable = getPageable(pageable);

        return incidentReportRepository.getIncidentReportsByUserId(userId, status, level, category, keyword, pageable)
                                       .map(reportMapper::toIncidentReportListResponse);
    }


    public Page<ReportDTO.GetLocationReportListResponse> getLocationReportsByUserId(
            UUID userId,
            String keyword,
            String status,
            String category,
            Pageable pageable
    ) {
        pageable = getPageable(pageable);

        return locationReportRepository.getLocationReportsByUserId(userId, keyword, category, status, pageable)
                                       .map(reportMapper::toLocationReportListResponse);
    }

    public ReportDTO.GetLocationReportResponse getLocationReportByIdAndUserId(UUID locationId, UUID userId) {
        LocationReport locationReport = locationReportRepository.getLocationReportById(locationId)
                                                                .orElseThrow(() -> new ReportNotFoundException(
                                                                        "Location report not found"));

        if (!locationReport.getUser().getId().equals(userId)) {
            throw new PermissionDeniedException("You don't have permission to access this location report",
                                                "REPORT_ACCESS_DENIED");
        }

        return reportMapper.toLocationReportResponse(locationReport);
    }

    public ReportDTO.GetIncidentReportResponse getIncidentReportByIdAndUserId(UUID incidentId, UUID userId) {
        IncidentReport incidentReport = incidentReportRepository.findById(incidentId)
                                                                .orElseThrow(() -> new ReportNotFoundException(
                                                                        "Incident report not found"));

        if (!incidentReport.getUser().getId().equals(userId)) {
            throw new PermissionDeniedException("You don't have permission to access this incident report",
                                                "REPORT_ACCESS_DENIED");
        }

        return reportMapper.toIncidentReportResponse(incidentReport);
    }

    @Transactional
    public void createLocationReport(ReportDTO.CreateLocationRequest request, UUID userId) {
        LocationReport locationReport = reportMapper.toLocationReport(request);

        User userProxy = userRepository.getReferenceById(userId);
        locationReport.setUser(userProxy);

        if (request.locationId() != null) {
            Location locationProxy = locationRepository.getReferenceById(request.locationId());
            locationReport.setLocation(locationProxy);
        }

        locationReport = locationReportRepository.save(locationReport);

        if (request.files() != null) {
            List<String> imageUrls = fileStorageService.uploadFiles(request.files(),
                                                                    LOCATION_FOLDER_NAME,
                                                                    locationReport.getId().toString());
            locationReport.setImageUrls(imageUrls);
        }

        locationReportRepository.save(locationReport);
    }

    @Transactional
    public void createIncidentReport(ReportDTO.CreateIncidentRequest request, UUID userId) {
        // Filter offensive words
        if (!contentFilterService.isValidContent(request.description())) {
            Set<String> offensiveWords = contentFilterService.findOffensiveWords(request.description());
            throw new IllegalArgumentException("Incident description contains offensive content: " + offensiveWords);
        }

        IncidentReport incidentReport = reportMapper.toIncidentReport(request);
        User userProxy = userRepository.getReferenceById(userId);
        incidentReport.setUser(userProxy);
        incidentReport = incidentReportRepository.save(incidentReport);

        List<String> imageUrls = fileStorageService.uploadFiles(request.files(),
                                                                INCIDENT_FOLDER_NAME,
                                                                incidentReport.getId().toString());
        incidentReport.setImageUrls(imageUrls);
        incidentReportRepository.save(incidentReport);

        redisService.invalidatePendingTiles();

        List<CharSequence> avroImageUrls = new ArrayList<>(incidentReport.getImageUrls());

        IncidentReportInProgressEvent event = IncidentReportInProgressEvent.newBuilder()
                                                                           .setId(incidentReport.getId()
                                                                                                .toString())              // Convert UUID -> String
                                                                           .setLatitude(request.latitude())
                                                                           .setLongitude(request.longitude())
                                                                           .setStatus(incidentReport.getStatus()
                                                                                                    .toString())
                                                                           .setCategory(request.category()
                                                                                               .name())                // Convert Enum -> String
                                                                           .setLevel(request.level()
                                                                                            .name())                      // Convert Enum -> String
                                                                           .setDescription(request.description())
                                                                           .setImageUrls(avroImageUrls)                           // List đã được ép kiểu
                                                                           .setTimestamp(incidentReport.getCreatedAt()
                                                                                                       .toEpochMilli()) // Convert Instant -> Long (Mili-giây)
                                                                           .build();

        incidentEventProducer.publishIncidentReportInProgressEvent(event);
    }

    public ReportDTO.GetIncidentReportResultResponse getIncidentResult(UUID reportId, UUID id) {
        IncidentReport report = incidentReportRepository.findById(reportId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Incident report not found"));

        if (report.getUser().getId().equals(id) && report.getResolver().getId().equals(id)) {
            throw new PermissionDeniedException("You don't have permission to access this incident report",
                                                "REPORT_ACCESS_DENIED");
        }
        IncidentReportResult incidentReportResult = incidentReportResultService.getIncidentResultByReportId(reportId);
        return reportMapper.toIncidentReportResultResponse(incidentReportResult);
    }

    public Page<ReportDTO.GetLocationReportListResponse> getPendingLocationReports(
            String keyword,
            String category,
            Pageable pageable
    ) {
        pageable = getPageable(pageable);

        return locationReportRepository.getPendingLocationReports(keyword, category, pageable)
                                       .map(reportMapper::toLocationReportListResponse);
    }

    @NonNull
    private Pageable getPageable(Pageable pageable) {
        if (pageable.isPaged()) {
            int page = pageable.getPageNumber();
            int size = pageable.getPageSize();
            boolean needsUpdate = false;

            if (page < 0) {
                page = 0;
                needsUpdate = true;
            }

            if (size < 1 || size > MAX_PAGE_SIZE) {
                size = MAX_PAGE_SIZE;
                needsUpdate = true;
            }

            if (needsUpdate) {
                pageable = PageRequest.of(page, size, pageable.getSort());
            }
        }
        return pageable;
    }

    public Page<ReportDTO.GetLocationReportListResponse> getLocationReportsByAdminId(
            UUID adminId,
            String status,
            String category,
            String keyword,
            Pageable pageable
    ) {
        pageable = getPageable(pageable);

        return locationReportRepository.getLocationReportsByAdminId(adminId, status, category, keyword, pageable)
                                       .map(reportMapper::toLocationReportListResponse);
    }

    @Transactional
    public void assignLocationReport(UUID reportId, UUID adminId) {
        LocationReport report = locationReportRepository.findById(reportId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Location report not found"));

        if (report.getStatus() != LocationReport.Status.pending_review) {
            throw new InvalidReportStateException(
                    "Location report is not in pending review state and cannot be assigned.");
        }

        User adminProxy = userRepository.getReferenceById(adminId);
        report.setResolver(adminProxy);
        report.setStatus(LocationReport.Status.processing);
        locationReportRepository.save(report);
    }


    @Transactional
    public void assignIncidentReport(UUID reportId, UUID adminId) {
        IncidentReport report = incidentReportRepository.findById(reportId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Incident report not found"));

        if (report.getStatus() != IncidentReport.Status.pending_review) {
            throw new InvalidReportStateException(
                    "Incident report is not in pending review state and cannot be assigned");
        }

        User adminProxy = userRepository.getReferenceById(adminId);
        report.setResolver(adminProxy);
        report.setStatus(IncidentReport.Status.processing);
        incidentReportRepository.save(report);

        redisService.invalidatePendingTiles();

        List<CharSequence> avroImageUrls = new ArrayList<>(report.getImageUrls());

        IncidentReportInProgressEvent event = IncidentReportInProgressEvent.newBuilder()
                                                                           .setId(report.getId()
                                                                                        .toString())
                                                                           .setLongitude(report.getGeomPoint().getX())
                                                                           .setLatitude(report.getGeomPoint().getY())
                                                                           .setStatus(report.getStatus()
                                                                                            .toString())
                                                                           .setCategory(report.getCategory().toString())
                                                                           .setLevel(report.getLevel().toString())
                                                                           .setDescription(report.getDescription())
                                                                           .setImageUrls(avroImageUrls)
                                                                           .setTimestamp(report.getCreatedAt()
                                                                                               .toEpochMilli())
                                                                           .build();

        incidentEventProducer.publishIncidentReportInProgressEvent(event);
    }

    public Page<ReportDTO.GetIncidentReportListResponse> getIncidentReportsByAdminId(
            UUID adminId,
            String status,
            String level,
            String category,
            String keyword,
            Pageable pageable
    ) {
        pageable = getPageable(pageable);

        return incidentReportRepository.getIncidentReportsByAdminId(adminId, status, level, category, keyword, pageable)
                                       .map(reportMapper::toIncidentReportListResponse);
    }

    public ReportDTO.GetLocationReportResponse getLocationReportByIdAndAdminId(UUID locationId, UUID adminId) {
        LocationReport locationReport = locationReportRepository.getLocationReportById(locationId)
                                                                .orElseThrow(() -> new ReportNotFoundException(
                                                                        "Location report not found"));

        return reportMapper.toLocationReportResponse(locationReport);
    }

    public ReportDTO.GetIncidentReportResponse getIncidentReportByIdAndAdminId(UUID incidentId, UUID adminId) {
        IncidentReport report = incidentReportRepository.findById(incidentId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Incident report not found"));

        return reportMapper.toIncidentReportResponse(report);
    }

    @Transactional
    public void createIncidentReportResult(UUID reportId, UUID adminId, ReportDTO.CreateIncidentResultRequest request) {
        IncidentReport report = incidentReportRepository.findById(reportId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Incident report not found"));

        if (report.getResolver() == null || !report.getResolver().getId().equals(adminId)) {
            throw new PermissionDeniedException("You don't have permission to create a result for this incident report",
                                                "REPORT_RESULT_ACCESS_DENIED");
        }

        List<String> imageUrls = fileStorageService.uploadFiles(request.files(),
                                                                INCIDENT_FOLDER_NAME,
                                                                reportId + "/result");

        IncidentReportResult reportResult = IncidentReportResult.builder()
                                                                .incidentReport(report)
                                                                .resolver(report.getResolver())
                                                                .description(request.description())
                                                                .imageUrls(imageUrls)
                                                                .build();

        incidentReportResultRepository.save(reportResult);

        if (request.status() == IncidentReport.Status.approved) report.setStatus(IncidentReport.Status.approved);
        if (request.status() == IncidentReport.Status.rejected) report.setStatus(IncidentReport.Status.rejected);

        redisService.invalidateProcessingTiles();
        IncidentReportClosedEvent event = IncidentReportClosedEvent.newBuilder().setId(reportId.toString()).build();
        incidentEventProducer.publishIncidentReportClosedEvent(event);
    }

    @Transactional
    public void updateIncidentReportResult(
            UUID reportResultId,
            UUID adminId,
            ReportDTO.UpdateIncidentResultRequest request
    ) {
        IncidentReportResult reportResult = incidentReportResultService.getIncidentResultByReportId(reportResultId);
        IncidentReport report = reportResult.getIncidentReport();
        User admin = reportResult.getResolver();

        if (admin == null || !admin.getId().equals(adminId)) {
            throw new PermissionDeniedException("You don't have permission to update a result for this incident report",
                                                "REPORT_RESULT_ACCESS_DENIED");
        }

        if (request.files() != null) {
            fileStorageService.deleteFiles(reportResult.getImageUrls());
            List<String> newImageUrls = fileStorageService.uploadFiles(request.files(),
                                                                       INCIDENT_FOLDER_NAME,
                                                                       report.getId() + "/result");

            reportResult.setImageUrls(newImageUrls);
        }

        if (!request.description().isEmpty()) {
            reportResult.setDescription(request.description());
        }

        if (!report.getStatus().equals(request.status())) report.setStatus(request.status());
    }

    @Transactional
    public void ratingIncidentResult(
            UUID reportResultId,
            UUID userId,
            ReportDTO.RatingIncidentReportResultRequest request
    ) {
        IncidentReportResult reportResult = incidentReportResultService.getIncidentResultByReportId(reportResultId);

        if (!reportResult.getIncidentReport().getUser().getId().equals(userId)) {
            throw new PermissionDeniedException("You don't have permission to rating this incident result report",
                                                "REPORT_ACCESS_DENIED");
        }

        IncidentReport incidentReport = reportResult.getIncidentReport();
        if (incidentReport.getStatus() != IncidentReport.Status.approved && incidentReport.getStatus() != IncidentReport.Status.rejected) {
            throw new InvalidReportStateException(
                    "Location report is not in an approved or rejected state and cannot be rated");
        }

        reportResult.setSatisfactionRating(request.satisfactionRating());
        if (!request.satisfactionComment().isEmpty()) {
            reportResult.setSatisfactionComment(request.satisfactionComment());
        }
    }

    @Transactional
    public void approveLocationReport(UUID reportId, UUID adminId) {
        LocationReport report = locationReportRepository.findById(reportId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Location report not found"));

        Location location;

        if (report.getLocation() == null) {
            Location newLocation = new Location();
            location = locationRepository.saveAndFlush(newLocation);
        } else {
            location = locationRepository.findById(report.getLocation().getId())
                                         .orElseThrow(() -> new LocationNotFound("Location not found"));
        }

        LocationRevision revision = reportMapper.toLocationRevision(report);
        revision.setLocation(location);
        revision = locationRevisionRepository.save(revision);

        location.setCurrentRevision(revision);
        locationRepository.save(location);

        report.setStatus(LocationReport.Status.approved);

        User admin = userRepository.findById(adminId)
                                   .orElseThrow(() -> new UserNotFoundException("Admin is not found"));
        report.setResolver(admin);
        locationReportRepository.save(report);
    }

    @Transactional
    public void rejectLocationReport(UUID reportId, UUID adminId) {
        LocationReport report = locationReportRepository.findById(reportId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Location report not found"));

        report.setStatus(LocationReport.Status.rejected);
        User admin = userRepository.findById(adminId)
                                   .orElseThrow(() -> new UserNotFoundException("Admin is not found"));
        report.setResolver(admin);
        locationReportRepository.save(report);
    }

    public List<ReportDTO.GetLocationRevisionResponse> getRevisionsByLocationReportId(UUID reportId) {
        LocationReport report = locationReportRepository.findById(reportId)
                                                        .orElseThrow(() -> new ReportNotFoundException(
                                                                "Location report not found"));
        Location location = report.getLocation();
        if (location == null) {
            return null;
        }

        return location.getLocationRevisions().stream().map(reportMapper::toLocationRevisionResponse).toList();
    }

    @Transactional
    public void updateLocationReport(ReportDTO.UpdateLocationRequest request, UUID userId) {
        MapDTO.GetLocationResponse location = mapService.getLocationById(request.locationId());
        LocationReport locationReport = reportMapper.createFromLocation(location);
        reportMapper.updateFromRequest(request, locationReport);

        if (request.latitude() != null && request.longitude() != null) {
            locationReport.setGeomPoint(reportMapper.createPoint(request.longitude(), request.latitude()));
        } else {
            locationReport.setGeomPoint(reportMapper.createPoint(location.longitude(), location.latitude()));
        }

        locationReport.setLocation(locationRepository.getReferenceById(request.locationId()));
        locationReport.setUser(userRepository.getReferenceById(userId));

        if (locationReport.getId() == null) {
            locationReport = locationReportRepository.save(locationReport);
        }

        if (request.files() != null && !request.files().isEmpty()) {
            List<String> newImageUrls = fileStorageService.uploadFiles(
                    request.files(),
                    INCIDENT_FOLDER_NAME,
                    locationReport.getId().toString()
            );
            locationReport.setImageUrls(newImageUrls);
        } else {
            locationReport.setImageUrls(location.imageUrls());
        }

        locationReportRepository.save(locationReport);
    }
}
