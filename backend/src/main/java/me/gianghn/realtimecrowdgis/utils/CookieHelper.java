package me.gianghn.realtimecrowdgis.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieHelper {
    @Value("${app.jwt.refreshExpirationDays}")
    private long refreshExpirationDays;

    @Value("${app.cookie.secure}")
    private boolean isSecure;

    @Value("${app.cookie.sameSite}")
    private String sameSite;

    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from("refresh_token", refreshToken)
                             .httpOnly(true)
                             .secure(isSecure)
                             .path("/api/v1/auth")
                             .maxAge(refreshExpirationDays * 24 * 60 * 60)
                             .sameSite(sameSite)
                             .build();
    }

    public ResponseCookie clearRefreshTokenCookie() {
        return ResponseCookie.from("refresh_token", "")
                             .httpOnly(true)
                             .secure(isSecure)
                             .path("/api/v1/auth")
                             .maxAge(0)
                             .sameSite(sameSite)
                             .build();
    }
}
