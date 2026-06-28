package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class InvalidReportStateException extends ApplicationException {
    public InvalidReportStateException(String message, String errorCode) {
        super(message, 409, errorCode);
    }

    public InvalidReportStateException(String message) {
        super(message, 409, "REPORT_NOT_PENDING");
    }
}
