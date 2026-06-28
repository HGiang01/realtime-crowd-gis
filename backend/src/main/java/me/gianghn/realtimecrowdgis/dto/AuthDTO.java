package me.gianghn.realtimecrowdgis.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
import me.gianghn.realtimecrowdgis.entity.RefreshToken;
import me.gianghn.realtimecrowdgis.entity.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public interface AuthDTO {
    record RegisterRequest(
            @NotBlank(message = "Username is required")
            @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
            @Pattern(regexp = "^[a-zA-Z0-9_]+$",
                     message = "Invalid username. Only letters, numbers, and underscores are accepted")
            String username,

            @NotBlank(message = "Password is required")
            @Pattern(
                    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_])\\S{8,}$",
                    message = "Password must be at least 8 characters long, contain no spaces, and include uppercase, lowercase, number, and special character"
            )
            String password,

            @NotBlank(message = "Confirm password is required")
            String confirmPassword,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @Pattern(regexp = "^(?:\\+84|84|0)[35789]\\d{8}$", message = "Invalid phone number format")
            String phone,

            @Past(message = "Date of birth must be in the past")
            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
            LocalDate dob
    ) {
        @JsonIgnore
        @AssertTrue(message = "Passwords do not match")
        public boolean isConfirmPasswordValid() {
            // For @NotBlank check
            if (password == null || confirmPassword == null) {
                return true;
            }
            return password.equals(confirmPassword);
        }
    }

    record LoginRequest(
            @NotBlank(message = "Username or email is required")
            String usernameOrEmail,
            @NotBlank(message = "Password is required")
            String password
    ) {
    }

    record ForgotPasswordRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email
    ) {
    }

    record ResetPasswordRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "New password is required")
            @Pattern(
                    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_])\\S{8,}$",
                    message = "Password must be at least 8 characters long, contain no spaces, and include uppercase, lowercase, number, and special character"
            )
            String newPassword,

            @NotBlank(message = "Confirm new password is required")
            String confirmNewPassword,

            @NotBlank(message = "OTP code is required")
            String otp
    ) {
        @JsonIgnore
        @AssertTrue(message = "Passwords do not match")
        public boolean isConfirmPasswordValid() {
            // For @NotBlank check
            if (newPassword == null || confirmNewPassword == null) {
                return true;
            }
            return newPassword.equals(confirmNewPassword);
        }
    }

    record GoogleOAuthResponse(
            String email,
            String provider,
            String providerUserId
    ) {
    }

    record AccessTokenResponse(
            Instant createdAt,
            Instant exp,
            String accessToken
    ) {
    }

    record AccessTokenInfo(
            UUID userId,
            User.UserRole role
    ) {
    }

    record AuthResult(
            User user,
            RefreshToken refreshToken
    ) {
    }
}