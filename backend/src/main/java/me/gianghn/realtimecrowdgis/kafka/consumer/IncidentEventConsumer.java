package me.gianghn.realtimecrowdgis.kafka.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.dto.ReportDTO;
import me.gianghn.realtimecrowdgis.event.IncidentReportClosedEvent;
import me.gianghn.realtimecrowdgis.event.IncidentReportInProgressEvent;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class IncidentEventConsumer {
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "incident-report", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeEvent(ConsumerRecord<String, Object> record, Acknowledgment ack) {
        try {
            Object eventValue = record.value();

            if (eventValue instanceof IncidentReportInProgressEvent inProgressEvent) {
                handleInProgress(inProgressEvent);
            } else if (eventValue instanceof IncidentReportClosedEvent closedEvent) {
                handleClosed(closedEvent);
            } else {
                log.warn("Received an unknown event: {}", eventValue.getClass().getName());
            }

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing incident report event: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    private void handleInProgress(IncidentReportInProgressEvent event) {
        // refactor: using mapstruct
        ReportDTO.RealtimeIncidentInProgressMessage wsMessage = new ReportDTO.RealtimeIncidentInProgressMessage(

                event.getId().toString(),

                event.getDescription().toString(),

                event.getLatitude(),

                event.getLongitude(),

                event.getCategory().toString(),

                event.getLevel().toString(),

                event.getImageUrls().stream().map(CharSequence::toString).toList(),

                event.getTimestamp()

        );

        switch (String.valueOf(event.getStatus())) {
            case "pending_review":
                messagingTemplate.convertAndSend("/topic/pending-incident-reports", wsMessage);
                break;
            case "processing":
                messagingTemplate.convertAndSend("/topic/processing-incident-reports", wsMessage);
                break;
            default:
                log.warn("Unknown in-progress status: {}", event.getStatus());
        }
    }

    private void handleClosed(IncidentReportClosedEvent event) {
        log.info("Handling the Closed event: {}", event);

        ReportDTO.RealtimeIncidentClosedMessage wsMessage = new ReportDTO.RealtimeIncidentClosedMessage(
                event.getId().toString()
        );
        messagingTemplate.convertAndSend("/topic/closed-incident-reports", wsMessage);
    }
}