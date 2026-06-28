package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class TooManyRequestsException extends ApplicationException {
    public TooManyRequestsException(String message, String errorCode) {
        super(message, 429, errorCode);
    }

    public TooManyRequestsException(String message) {
        super(message, 429, "TOO_MANY_REQUESTS");
    }
}
