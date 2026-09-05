package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class InvalidTokenException extends ApplicationException {

    public InvalidTokenException(String message, String errorCode) {
        super(message, 401, errorCode);
    }

    public InvalidTokenException(String message) {
        super(message, 401, "INVALID_TOKEN");
    }

}
