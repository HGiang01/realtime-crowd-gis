package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class PermissionDeniedException extends ApplicationException {
    public PermissionDeniedException(String message, String errorCode) {
        super(message, 403, errorCode);
    }

    public PermissionDeniedException(String message) {
        super(message, 403, "FORBIDDEN");
    }
}
