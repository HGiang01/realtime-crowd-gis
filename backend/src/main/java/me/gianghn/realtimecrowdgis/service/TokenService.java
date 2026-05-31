package me.gianghn.realtimecrowdgis.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.dto.AuthDTO;
import me.gianghn.realtimecrowdgis.entity.RefreshToken;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.exception.specify.InvalidTokenException;
import me.gianghn.realtimecrowdgis.repository.RefreshTokenRepository;
import me.gianghn.realtimecrowdgis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final int NUMBER_OF_DEVICES_PER_USER = 5;
    private final UserRepository userRepository;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expirationMs}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refreshExpirationDays}")
    private int refreshExpirationDays;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public AuthDTO.AccessTokenResponse createAccessToken(User user) {
        Instant createdDate = Instant.now();
        String accessToken = Jwts.builder()
                                 .subject(user.getUsername())
                                 .claim("userId", user.getId())
                                 .claim("role", user.getRole().name())
                                 .issuedAt(Date.from(createdDate))
                                 .expiration(Date.from(createdDate.plusMillis(jwtExpirationMs)))
                                 .signWith(getSigningKey())
                                 .compact();
        return new AuthDTO.AccessTokenResponse(createdDate, createdDate.plusMillis(jwtExpirationMs), accessToken);
    }

    public void verifyAccessToken(String accessToken) {
        Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(accessToken);
    }

    public AuthDTO.AccessTokenInfo extractBearerToken(String bearerToken) {
        String accessToken = bearerToken.substring(7);
        Claims claims = Jwts.parser()
                            .verifyWith(getSigningKey())
                            .build()
                            .parseSignedClaims(accessToken)
                            .getPayload();
        String userIdStr = claims.get("userId", String.class);
        UUID userId = UUID.fromString(userIdStr);
        User.UserRole role = User.UserRole.valueOf(claims.get("role", String.class));

        return new AuthDTO.AccessTokenInfo(userId, role);
    }

    public UUID getUserIdFromAccessToken(String accessToken) {
        Claims claims = Jwts.parser()
                            .verifyWith(getSigningKey())
                            .build()
                            .parseSignedClaims(accessToken)
                            .getPayload();
        String userIdStr = claims.get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        UUID userId = user.getId();
        Long existingTokens = refreshTokenRepository.countByUserId(userId);

        if (existingTokens >= NUMBER_OF_DEVICES_PER_USER) {
            refreshTokenRepository.deleteLastUsedByUserId(userId);
        }

        String tokenStr = UUID.randomUUID().toString();
        RefreshToken newRefreshToken = RefreshToken.builder()
                                                   .token(tokenStr)
                                                   .user(user)
                                                   .expiresAt(new Date(System.currentTimeMillis() + refreshExpirationDays * 24L * 60L * 60L * 1000L).toInstant())
                                                   .build();
        refreshTokenRepository.save(newRefreshToken);

        return newRefreshToken;
    }


    public RefreshToken verifyRefreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findRefreshTokenByToken(refreshTokenStr)
                                                          .orElseThrow(() -> new InvalidTokenException("Invalid refresh token!", "INVALID_REFRESH_TOKEN"));

        if (refreshToken.getExpiresAt().isBefore(new Date().toInstant())) {
            throw new InvalidTokenException("Refresh token has expired!", "EXPIRED_REFRESH_TOKEN");
        }

        if (refreshToken.isRevoked()) {
            throw new InvalidTokenException("Refresh token has been revoked!", "REVOKED_REFRESH_TOKEN");
        }

        return refreshToken;
    }

    public UUID findUserIdByRefreshToken(String refreshTokenStr) {
        return refreshTokenRepository.findUserId(refreshTokenStr);
    }

    public void updateLastUsedAt(String refreshTokenStr, Instant lastUsedDate) {
        RefreshToken refreshToken = refreshTokenRepository.findRefreshTokenByToken(refreshTokenStr)
                                                          .orElseThrow(() -> new InvalidTokenException("Invalid refresh token!", "INVALID_REFRESH_TOKEN"));
        refreshToken.setLastUsedAt(lastUsedDate);
        refreshTokenRepository.save(refreshToken);
    }

    public int revokeRefreshTokenByToken(String refreshTokenStr) {
        return refreshTokenRepository.revokeRefreshTokenByToken(refreshTokenStr);
    }

    public int revokeRefreshTokensByUserId(UUID userId) {
        return refreshTokenRepository.revokeRefreshTokenByUserId(userId);
    }

    public void deleteRefreshToken(UUID tokenId) {
        refreshTokenRepository.deleteById(tokenId);
    }

    public void deleteAllRefreshTokens(UUID userId) {
        refreshTokenRepository.deleteAllByUserId(userId);
    }
}
