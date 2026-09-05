package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.UserAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserAuthProviderRepository extends JpaRepository<UserAuthProvider, UUID> {
    boolean existsByProviderAndProviderUserId(String provider, String providerUserId);

    Optional<UserAuthProvider> findByProviderAndProviderUserId(String provider, String providerUserId);

    @Query(value = "select * from t_user_auth_providers where user_id = :id", nativeQuery = true)
    Optional<UserAuthProvider> findUserAuthProviderByUserId(@Param("id") UUID id);
}
