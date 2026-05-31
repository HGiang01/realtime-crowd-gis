package me.gianghn.realtimecrowdgis.controller;

import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.ApiResponse;
import me.gianghn.realtimecrowdgis.dto.UserDTO.GetMeResponse;
import me.gianghn.realtimecrowdgis.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<GetMeResponse>> getMe(@AuthenticationPrincipal UUID userId) {
        GetMeResponse userProfile = userService.getMe(userId);
        return ResponseEntity.ok(ApiResponse.success("Get user successfully", userProfile));
    }
}