package me.gianghn.realtimecrowdgis.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
import me.gianghn.realtimecrowdgis.entity.User;

import java.time.LocalDate;
import java.util.UUID;

public interface UserDTO {
    record UpdateStatusRequest(
            @NotBlank(message = "User ID is required")
            UUID userId,

            @NotNull(message = "Status is required")
            User.UserStatus status
    ) {
    }

    record UpdateProfileRequest(
            @NotBlank(message = "User ID is required")
            UUID userId,

            @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
            @Pattern(regexp = "^[a-zA-Z0-9_]+$",
                     message = "Invalid username. Only letters, numbers, and underscores are accepted")
            String username,

            @Email(message = "Invalid email format")
            String email,

            @Pattern(regexp = "^(?:\\+84|84|0)[35789]\\d{8}$", message = "Invalid phone number format")
            String phone,

            @Past(message = "Date of birth must be in the past")
            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
            LocalDate dob
    ) {
    }

    record UpdatePasswordRequest(
            @NotBlank(message = "User ID is required")
            UUID userId,

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

    record DeleteRequest(
            @NotBlank(message = "User ID is required")
            UUID userId
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

}
