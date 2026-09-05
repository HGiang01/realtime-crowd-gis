package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class UserAlreadyExistsException extends ApplicationException {
    public UserAlreadyExistsException(String message, String errorCode) {
        super(message, 409, errorCode);
    }

    public UserAlreadyExistsException(String message) {
        super(message, 409, "USER_ALREADY_EXISTS");
    }
}
