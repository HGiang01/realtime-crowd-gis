package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class AccountNotActiveException extends ApplicationException {
    public AccountNotActiveException(String message, String errorCode) {
        super(message, 403, errorCode);
    }

    public AccountNotActiveException(String message) {
        super(message, 403, "INACTIVE_ACCOUNT");
    }
}
