package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class InvalidAccountStateException extends ApplicationException {
    public InvalidAccountStateException(String message, String errorCode) {
        super(message, 409, errorCode);
    }

    public InvalidAccountStateException(String message) {
        super(message, 409, "ACCOUNT_NOT_PENDING");
    }
}
