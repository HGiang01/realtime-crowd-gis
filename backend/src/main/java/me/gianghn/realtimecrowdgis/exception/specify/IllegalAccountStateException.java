package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class IllegalAccountStateException extends ApplicationException {
    public IllegalAccountStateException(String message, String errorCode) {
        super(message, 500, errorCode);
    }

    public IllegalAccountStateException(String message) {
        super(message, 500, "ACCOUNT_DATA_ANOMALY");
    }
}
