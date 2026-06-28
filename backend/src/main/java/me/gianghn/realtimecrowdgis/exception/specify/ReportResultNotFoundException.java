package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class ReportResultNotFoundException extends ApplicationException {
    public ReportResultNotFoundException(String message, String errorCode) {
        super(message, 404, errorCode);
    }

    public ReportResultNotFoundException(String message) {
        super(message, 404, "REPORT_RESULT_NOT_FOUND");
    }
}
