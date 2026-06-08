package me.gianghn.realtimecrowdgis.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import me.gianghn.realtimecrowdgis.entity.User;

public interface UserDTO {
    record UpdateStatusRequest(
            @NotNull(message = "Status is required")
            User.UserStatus status
    ) {
    }

    record UpdateProfileRequest(
            @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
            @Pattern(regexp = "^[a-zA-Z0-9_]+$",
                     message = "Invalid username. Only letters, numbers, and underscores are accepted")
            String username,

            @Pattern(regexp = "^(?:\\+84|84|0)[35789]\\d{8}$", message = "Invalid phone number format")
            String phone,

            @Past(message = "Date of birth must be in the past")
            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
            LocalDate dob
    ) {
    }

    record UpdatePasswordRequest(
            @NotBlank(message = "Current password is required")
            String currentPassword,

            @NotBlank(message = "New password is required")
            // prod: turn on
            // @Pattern(
            //         regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_])\\S{8,}$",
            //         message = "Password must be at least 8 characters long, contain no spaces, and include uppercase, lowercase, number, and special character"
            // )
            String newPassword,

            @NotBlank(message = "Confirm new password is required")
            String confirmNewPassword
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

    record NotifyRequest(
            @NotBlank(message = "Subject is required")
            String subject,

            @NotBlank(message = "Content is required")
            String content,

            String notes
    ) {
    }

    record GetMeResponse(
            String username,

            User.UserRole role,

            String email,

            String phone,

            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
            LocalDate dob
    ) {
    }

    record GetUserResponse(
            UUID id,

            String username,

            String email,

            User.UserRole role,

            String phone,

            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
            LocalDate dob,

            User.UserStatus status,

            Instant createdAt,

            Instant updatedAt
    ) {
    }
}
