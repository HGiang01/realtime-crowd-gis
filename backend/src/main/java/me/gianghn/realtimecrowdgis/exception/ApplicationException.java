package me.gianghn.realtimecrowdgis.exception;

import lombok.Getter;

@Getter
public abstract class ApplicationException extends RuntimeException {
    private final int httpStatus;
    private final String errorCode;

    public ApplicationException(String message, int httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }
}
