package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class ReportNotFoundException extends ApplicationException {
    public ReportNotFoundException(String message, String errorCode) {
        super(message, 404, errorCode);
    }

    public ReportNotFoundException(String message) {
        super(message, 404, "REPORT_NOT_FOUND");
    }
}
