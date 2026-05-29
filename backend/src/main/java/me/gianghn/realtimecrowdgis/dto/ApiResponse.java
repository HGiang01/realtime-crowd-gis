package me.gianghn.realtimecrowdgis.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "code", "message", "details", "path", "timestamp" })
public class ApiResponse<T> {
    @Builder.Default
    private Instant timestamp = Instant.now();
    private String code;
    private String message;
    private String path;
    private T details;

    // Success response with data
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder().code("SUCCESS").message(message).details(data).build();
    }

    // Success response with message
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder().code("SUCCESS").message(message).build();
    }

    // Fail response with message
    public static <T> ApiResponse<T> error(
            String code,
            String message,
            String path
    ) {
        return ApiResponse.<T>builder().code(code).message(message).path(path).build();
    }

    // Fail response with errors
    public static <T> ApiResponse<T> error(
            String code,
            String message,
            String path,
            T errors
    ) {
        return ApiResponse.<T>builder().code(code).message(message).path(path).details(errors).build();
    }
}
