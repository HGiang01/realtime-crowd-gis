package me.gianghn.realtimecrowdgis.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.AuthDTO;
import me.gianghn.realtimecrowdgis.repository.RefreshTokenRepository;
import me.gianghn.realtimecrowdgis.repository.UserRepository;
import me.gianghn.realtimecrowdgis.service.TokenService;
import me.gianghn.realtimecrowdgis.utils.CookieHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final OAuth2Service oAuth2Service;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenProvider;
    private final CookieHelper cookieHelper;

    @Value("${app.frontend.oauth2-redirect-url}")
    private String frontendRedirectUrl;
    @Value("${app.jwt.refresh-expiration-days}")
    private int refreshExpirationDays;

    @Override
    public void onAuthenticationSuccess(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        // Get user info from authentication object
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        if (oAuth2User == null) {
            throw new IllegalStateException("OAuth2User is null");
        }
        String email = oAuth2User.getAttribute("email");
        String providerUserId = oAuth2User.getAttribute("sub");

        AuthDTO.GoogleOAuthResponse googleOAuthResponse = new AuthDTO.GoogleOAuthResponse(email, "google", providerUserId);
        AuthDTO.AuthResult authResult = oAuth2Service.createOAuth2User(googleOAuthResponse);
        ResponseCookie cookie = cookieHelper.createRefreshTokenCookie(authResult.refreshToken().getToken());

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        // Redirect to frontend
        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                                               .build()
                                               .toUriString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}