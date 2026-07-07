package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class OffensiveWordsException extends ApplicationException {
    public OffensiveWordsException(String message, String errorCode) {
        super(message, 400, errorCode);
    }

    public OffensiveWordsException(String message) {
        super(message, 404, "OFFENSIVE_WORD_NOT_ALLOWED");
    }
}
