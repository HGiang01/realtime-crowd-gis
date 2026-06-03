package me.gianghn.realtimecrowdgis.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public interface OtpDTO {
    record ResendRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email
    ) {
    }

    record VerifyRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "OTP code is required")
            String otp
    ) {
    }

    record ResendResponse(
            @Email(message = "Invalid email format")
            String email,
            Instant expiresAt
    ) {
    }

}
