package me.gianghn.realtimecrowdgis.exception.specify;

import me.gianghn.realtimecrowdgis.exception.ApplicationException;

public class FileIOException extends ApplicationException {
    public FileIOException(String message, String errorCode) {super(message, 500, errorCode);}

    public FileIOException(String message) {
        super(message, 500, "FILE_IO_ERROR");
    }
}
