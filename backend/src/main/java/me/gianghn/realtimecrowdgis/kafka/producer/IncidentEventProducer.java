package me.gianghn.realtimecrowdgis.kafka.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.event.IncidentReportClosedEvent;
import me.gianghn.realtimecrowdgis.event.IncidentReportInProgressEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class IncidentEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "incident-report";

    public void publishIncidentReportInProgressEvent(IncidentReportInProgressEvent event) {
        // Ensure the same incident reports are sent to the same partition
        kafkaTemplate.send(TOPIC, event.getId().toString(), event);
    }

    public void publishIncidentReportClosedEvent(IncidentReportClosedEvent event) {
        kafkaTemplate.send(TOPIC, event.getId().toString(), event);
    }
}