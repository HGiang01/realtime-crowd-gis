package me.gianghn.realtimecrowdgis.security.oauth2;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.AuthDTO;
import me.gianghn.realtimecrowdgis.entity.RefreshToken;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.entity.UserAuthProvider;
import me.gianghn.realtimecrowdgis.exception.specify.AccountBannedException;
import me.gianghn.realtimecrowdgis.repository.UserAuthProviderRepository;
import me.gianghn.realtimecrowdgis.repository.UserRepository;
import me.gianghn.realtimecrowdgis.service.TokenService;
import me.gianghn.realtimecrowdgis.service.UserAuthProviderService;
import me.gianghn.realtimecrowdgis.service.UserService;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuth2Service {
    private final UserRepository userRepository;
    private final UserAuthProviderRepository userAuthProviderRepository;
    private final UserService userService;
    private final UserAuthProviderService userAuthProviderService;
    private final TokenService tokenService;

    @Transactional
    public AuthDTO.AuthResult createOAuth2User(AuthDTO.GoogleOAuthResponse response) {
        Optional<UserAuthProvider> providerOpt = userAuthProviderService.findByProviderAndProviderUserId(response.provider(), response.providerUserId());
        User userToLogin;

        if (providerOpt.isPresent()) {
            userToLogin = providerOpt.get().getUser();

            if (userToLogin.getStatus() != User.UserStatus.pending_verification && userToLogin.getStatus() != User.UserStatus.active) {
                throw new AccountBannedException("Your account has been banned. Please contact support for more information");
            }

            // Update email if user changed
            if (!Objects.equals(userToLogin.getEmail(), response.email())) {
                userToLogin.setEmail(response.email());
                userRepository.save(userToLogin);
            }
        } else {
            userToLogin = userService.findByEmail(response.email()).orElseGet(() -> User.builder()
                                                                                        .username(response.email())
                                                                                        .status(User.UserStatus.active)
                                                                                        .email(response.email())
                                                                                        .build()
            );

            if (userToLogin.getStatus() != User.UserStatus.pending_verification && userToLogin.getStatus() != User.UserStatus.active) {
                throw new AccountBannedException("Your account has been banned. Please contact support for more information");
            }

            if (userToLogin.getStatus() == User.UserStatus.pending_verification) {
                userToLogin.setStatus(User.UserStatus.active);
            }

            userToLogin = userRepository.save(userToLogin);

            UserAuthProvider userAuthProvider = UserAuthProvider.builder()
                                                                .provider(response.provider())
                                                                .providerUserId(response.providerUserId())
                                                                .user(userToLogin)
                                                                .build();
            userAuthProviderRepository.save(userAuthProvider);
        }

        RefreshToken refreshToken = tokenService.createRefreshToken(userToLogin);
        return new AuthDTO.AuthResult(userToLogin, refreshToken);
    }
}

