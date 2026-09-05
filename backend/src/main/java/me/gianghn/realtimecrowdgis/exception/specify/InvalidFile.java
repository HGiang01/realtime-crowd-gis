package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class InvalidFile extends ApplicationException {
    public InvalidFile(String message, String errorCode) {
        super(message, 400, errorCode);
    }

    public InvalidFile(String message) {
        super(message, 400, "INVALID_FILE");
    }

}
