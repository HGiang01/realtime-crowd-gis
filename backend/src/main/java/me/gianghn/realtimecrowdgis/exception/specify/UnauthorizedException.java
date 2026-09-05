package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class UnauthorizedException extends ApplicationException {
    public UnauthorizedException(String message, String errorCode) {
        super(message, 401, errorCode);
    }

    public UnauthorizedException(String message) {
        super(message, 401, "UNAUTHORIZED");
    }
}
