package me.gianghn.realtimecrowdgis.client;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

@HttpExchange
public interface MartinClient {
    @GetExchange("/current_locations_view/{z}/{x}/{y}")
    ResponseEntity<byte[]> getLocationTile(
            @PathVariable int z,
            @PathVariable int x,
            @PathVariable int y
    );

    @GetExchange("/pending_incident_view/{z}/{x}/{y}")
    ResponseEntity<byte[]> getPendingTile(
            @PathVariable int z,
            @PathVariable int x,
            @PathVariable int y
    );

    @GetExchange("/processing_incident_view/{z}/{x}/{y}")
    ResponseEntity<byte[]> getProcessingTile(
            @PathVariable int z,
            @PathVariable int x,
            @PathVariable int y
    );
}
