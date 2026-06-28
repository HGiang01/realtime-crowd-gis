package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.entity.IncidentReportResult;
import me.gianghn.realtimecrowdgis.exception.specify.ReportNotFoundException;
import me.gianghn.realtimecrowdgis.repository.IncidentReportResultRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncidentReportResultService {
    private final IncidentReportResultRepository incidentReportResultRepository;

    public IncidentReportResult getIncidentResultByReportId(UUID reportId) {
        return incidentReportResultRepository.findByReportId(reportId)
                                             .orElseThrow(() -> new ReportNotFoundException(
                                                     "Incident report result not found"));
    }

}
