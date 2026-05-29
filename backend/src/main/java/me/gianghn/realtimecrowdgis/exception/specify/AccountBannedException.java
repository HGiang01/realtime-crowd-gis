package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class AccountBannedException extends ApplicationException {
    public AccountBannedException(String message, String errorCode) {
        super(message, 403, errorCode);
    }

    public AccountBannedException(String message) {
        super(message, 403, "BANNED_ACCOUNT");
    }
}
