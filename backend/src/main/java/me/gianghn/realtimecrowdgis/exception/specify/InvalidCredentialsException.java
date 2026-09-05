package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class InvalidCredentialsException extends ApplicationException {
    public InvalidCredentialsException(String message, String errorCode) {
        super(message, 401, errorCode);
    }

    public InvalidCredentialsException(String message) {
        super(message, 401, "UNAUTHORIZED");
    }
}
