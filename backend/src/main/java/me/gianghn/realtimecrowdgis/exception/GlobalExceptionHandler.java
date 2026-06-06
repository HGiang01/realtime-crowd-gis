package me.gianghn.realtimecrowdgis.exception;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    // Application-specific exceptions
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ApiResponse<Void>> handleApplicationException(
            ApplicationException e,
            HttpServletRequest http
    ) {
        log.error("Application error: {}", e.getMessage(), e);
        ApiResponse<Void> errorMessage = ApiResponse.error(e.getErrorCode(), e.getMessage(), http.getRequestURI());
        return ResponseEntity.status(e.getHttpStatus()).body(errorMessage);
    }


    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException e,
            HttpServletRequest http
    ) {
        log.error("HttpMessageNotReadableException: {}", e.getMessage(), e);
        ApiResponse<Void> errorMessage = ApiResponse.error("BAD_REQUEST", "Required request body is missing or unreadable", http.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
    }

    // Valid DTO
    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            Exception e,
            HttpServletRequest request
    ) {
        log.error("Validation error: {}", e.getMessage(), e);
        Map<String, String> errors = new HashMap<>();

        if (e instanceof MethodArgumentNotValidException validEx) {
            if (validEx.getBindingResult() != null) {
                validEx.getBindingResult().getFieldErrors().forEach(error -> {
                    errors.put(error.getField(), error.getDefaultMessage());
                });
            }
        } else if (e instanceof BindException bindEx) {
            bindEx.getBindingResult().getFieldErrors().forEach(error -> {
                errors.put(error.getField(), error.getDefaultMessage());
            });
        }

        ApiResponse<Map<String, String>> errorMessage = ApiResponse.error("VALIDATION_ERROR", "Invalid input data", request.getRequestURI(), errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
    }

    // Invalid token exceptions
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<Void>> handleJwtException(JwtException e, HttpServletRequest request) {
        log.error("Invalid JWT token: {}", e.getMessage(), e);
        ApiResponse<Void> errorMessage = ApiResponse.error("INVALID_TOKEN", e.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorMessage);
    }

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(Exception e, HttpServletRequest request) {
        log.error("Access denied: {}", e.getMessage(), e);
        ApiResponse<Void> errorMessage = ApiResponse.error("FORBIDDEN", "You do not have permission to access this resource.", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorMessage);
    }

    // Catch-all for unexpected exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGlobalException(Exception e, HttpServletRequest request) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        ApiResponse<Void> errorMessage = ApiResponse.error("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
    }
}
