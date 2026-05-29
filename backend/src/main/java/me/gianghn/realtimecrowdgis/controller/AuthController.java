package me.gianghn.realtimecrowdgis.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.ApiResponse;
import me.gianghn.realtimecrowdgis.dto.AuthDTO;
import me.gianghn.realtimecrowdgis.dto.AuthDTO.AuthResult;
import me.gianghn.realtimecrowdgis.dto.AuthDTO.LoginRequest;
import me.gianghn.realtimecrowdgis.dto.AuthDTO.RegisterRequest;
import me.gianghn.realtimecrowdgis.dto.AuthDTO.RegisterResponse;
import me.gianghn.realtimecrowdgis.dto.OtpDTO;
import me.gianghn.realtimecrowdgis.service.AuthService;
import me.gianghn.realtimecrowdgis.service.EmailService;
import me.gianghn.realtimecrowdgis.utils.CookieHelper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final EmailService emailService;
    private final CookieHelper cookieHelper;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse newUser = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.success("Temporary user registration successful. Please verify your email via OTP", newUser));
    }


    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Void>> login(@Valid @RequestBody LoginRequest request) {
        AuthResult authResult = authService.login(request.usernameOrEmail(), request.password());
        ResponseCookie cookie = cookieHelper.createRefreshTokenCookie(authResult.refreshToken().getToken());

        return ResponseEntity.ok()
                             .header(HttpHeaders.SET_COOKIE, cookie.toString())
                             .body(ApiResponse.success("Login successful!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenStr,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(name = "all-devices", defaultValue = "false") boolean allDevices
    ) {
        authService.logout(refreshTokenStr, authHeader, allDevices);
        ResponseCookie cookie = cookieHelper.clearRefreshTokenCookie();

        return ResponseEntity.ok()
                             .header(HttpHeaders.SET_COOKIE, cookie.toString())
                             .body(ApiResponse.success("Logout" + (allDevices ? " all devices"
                                                                              : "") + " successfully!"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody OtpDTO.VerifyRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully!"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<OtpDTO.SendResponse>> sendOtp(@Valid @RequestBody OtpDTO.SendRequest request) {
        OtpDTO.SendResponse sendResponse = authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully!", sendResponse));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthDTO.AccessTokenResponse>> refreshAccessToken(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenStr
    ) {
        AuthDTO.AccessTokenResponse newAccessTokenResponse = authService.createAccessToken(refreshTokenStr);
        return ResponseEntity.ok(ApiResponse.success("Access token refreshed successfully!", newAccessTokenResponse));
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody AuthDTO.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("An OTP has been sent to that email address. Please check your inbox to confirm."));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody AuthDTO.ResetPasswordRequest request) {
        authService.resetPassword(request);
        ResponseCookie cookie = cookieHelper.clearRefreshTokenCookie();
        return ResponseEntity.ok()
                             .header(HttpHeaders.SET_COOKIE, cookie.toString())
                             .body(ApiResponse.success("Password reset successfully!"));
    }

}
