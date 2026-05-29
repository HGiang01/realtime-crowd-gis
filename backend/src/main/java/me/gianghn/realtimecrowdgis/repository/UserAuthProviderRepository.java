package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.UserAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserAuthProviderRepository extends JpaRepository<UserAuthProvider, UUID> {
    boolean existsByProviderAndProviderUserId(String provider, String providerUserId);

    Optional<UserAuthProvider> findByProviderAndProviderUserId(String provider, String providerUserId);
}
