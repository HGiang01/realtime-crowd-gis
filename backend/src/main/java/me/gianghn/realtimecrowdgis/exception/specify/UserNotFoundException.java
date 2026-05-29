package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class UserNotFoundException extends ApplicationException {
    public UserNotFoundException(String message, String errorCode) {
        super(message, 404, errorCode);
    }

    public UserNotFoundException(String message) {
        super(message, 404, "USER_NOT_FOUND");
    }
}
