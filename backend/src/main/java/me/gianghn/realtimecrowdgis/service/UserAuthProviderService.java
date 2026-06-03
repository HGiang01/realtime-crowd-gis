package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.entity.UserAuthProvider;
import me.gianghn.realtimecrowdgis.repository.UserAuthProviderRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserAuthProviderService {
    private final UserAuthProviderRepository userAuthProviderRepository;

    public Optional<UserAuthProvider> findByUserId(UUID id) {
        return userAuthProviderRepository.findUserAuthProviderByUserId(id);
    }

    public Optional<UserAuthProvider> findByProviderAndProviderUserId(String provider, String providerUserId) {
        return userAuthProviderRepository.findByProviderAndProviderUserId(provider, providerUserId);
    }

    public boolean existsUserAuthProvider(String provider, String providerUserId) {
        return userAuthProviderRepository.existsByProviderAndProviderUserId(provider, providerUserId);
    }
}
