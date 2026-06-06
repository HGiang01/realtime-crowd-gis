package me.gianghn.realtimecrowdgis.controller;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.ApiResponse;
import me.gianghn.realtimecrowdgis.dto.UserDTO;
import me.gianghn.realtimecrowdgis.dto.UserDTO.GetMeResponse;
import me.gianghn.realtimecrowdgis.dto.UserDTO.GetUserResponse;
import me.gianghn.realtimecrowdgis.dto.UserDTO.UpdatePasswordRequest;
import me.gianghn.realtimecrowdgis.dto.UserDTO.UpdateProfileRequest;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.service.UserService;
import me.gianghn.realtimecrowdgis.utils.CookieHelper;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CookieHelper cookieHelper;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<GetMeResponse>> getMe(@AuthenticationPrincipal UUID userId) {
        GetMeResponse userProfile = userService.getMe(userId);
        return ResponseEntity.ok(ApiResponse.success("Get user successfully", userProfile));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @AuthenticationPrincipal UUID userId, @RequestBody UpdateProfileRequest request
    ) {
        userService.updateUserProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully"));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UpdatePasswordRequest request
    ) {
        userService.updateUserPassword(userId, request);
        ResponseCookie cookie = cookieHelper.clearRefreshTokenCookie();

        return ResponseEntity.ok()
                             .header(HttpHeaders.SET_COOKIE, cookie.toString())
                             .body(ApiResponse.success("Password updated successfully"));
    }

    // Admin APIs
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GetUserResponse>> getUser(@PathVariable UUID id) {
        GetUserResponse userProfile = userService.getUser(id);
        return ResponseEntity.ok(ApiResponse.success("Get user successfully", userProfile));
    }


    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserDTO.UpdateStatusRequest request
    ) {
        userService.updateUserStatus(id, request);

        if (request.status() != User.UserStatus.active) {
            ResponseCookie cookie = cookieHelper.clearRefreshTokenCookie();

            return ResponseEntity.ok()
                                 .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                 .body(ApiResponse.success("User status updated successfully. User has been logged out."));
        }

        return ResponseEntity.ok(ApiResponse.success("User status updated successfully"));
    }

    @PostMapping("/{id}/notify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> notifyUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserDTO.NotifyRequest request
    ) {
        userService.notifyUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User notified successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUserByUserId(id);
        ResponseCookie cookie = cookieHelper.clearRefreshTokenCookie();

        return ResponseEntity.ok()
                             .header(HttpHeaders.SET_COOKIE, cookie.toString())
                             .body(ApiResponse.success("User deleted successfully"));
    }
}