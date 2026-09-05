package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class LocationNotFound extends ApplicationException {
    public LocationNotFound(String message, String errorCode) {
        super(message, 404, errorCode);
    }

    public LocationNotFound(String message) {
        super(message, 404, "LOCATION_NOT_FOUND");
    }
}
