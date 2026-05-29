package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    void deleteAllByUserId(UUID userId);

    Long countByUserId(UUID userId);

    @Modifying
    @Query(value = "delete from t_refresh_tokens where id = (select rt.id from t_refresh_tokens rt where rt.user_id = :userId order by rt.last_used_at asc limit 1)",
           nativeQuery = true)
    void deleteLastUsedByUserId(@Param("userId") UUID userId);

    @Query(value = "select ft.user_id from t_refresh_tokens ft where ft.token = :refreshToken limit 1",
           nativeQuery = true)
    UUID findUserId(@Param("refreshToken") String refreshTokenStr);

    Optional<RefreshToken> findRefreshTokenByToken(String refreshTokenStr);

    @Modifying
    @Query(value = "update t_refresh_tokens set is_revoked = true where token = :token", nativeQuery = true)
    int revokeRefreshTokenByToken(@Param("token") String refreshTokenStr);

    @Modifying
    @Query(value = "update t_refresh_tokens set is_revoked = true where user_id = :userId", nativeQuery = true)
    int revokeRefreshTokenByUserId(@Param("userId") UUID userId);

}
