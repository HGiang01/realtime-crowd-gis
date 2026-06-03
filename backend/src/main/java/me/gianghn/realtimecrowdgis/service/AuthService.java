package me.gianghn.realtimecrowdgis.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.AuthDTO;
import me.gianghn.realtimecrowdgis.dto.AuthDTO.AuthResult;
import me.gianghn.realtimecrowdgis.dto.AuthDTO.RegisterRequest;
import me.gianghn.realtimecrowdgis.dto.OtpDTO;
import me.gianghn.realtimecrowdgis.entity.RefreshToken;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.exception.specify.AccountNotActiveException;
import me.gianghn.realtimecrowdgis.exception.specify.InvalidCredentialsException;
import me.gianghn.realtimecrowdgis.exception.specify.UserAlreadyExistsException;
import me.gianghn.realtimecrowdgis.exception.specify.UserNotFoundException;
import me.gianghn.realtimecrowdgis.mapper.UserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    @Transactional
    public void register(RegisterRequest request) {
        if (userService.existsUserByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username is already in use!");
        }

        if (userService.existsUserByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email is already in use!");
        }

        User newUser = userService.createTempUser(userMapper.toEntity(request));

        emailService.sendOtp(newUser.getEmail());
    }


    public AuthResult login(String usernameOrEmail, String password) {
        // Regex for validate username
        String regex = "^[a-zA-Z0-9_]+$";
        String loginId = usernameOrEmail.trim();
        Optional<User> optionalUser;

        if (loginId.matches(regex)) {
            optionalUser = userService.findByUsername(usernameOrEmail.trim());
        } else {
            optionalUser = userService.findByEmail(usernameOrEmail.trim());
        }

        User user = optionalUser.orElseThrow(
                () -> new InvalidCredentialsException("Username or newPassword is invalid", "INVALID_USER_OR_PASSWORD")
        );

        if (!checkPassword(password, optionalUser.get().getPassword())) {
            throw new InvalidCredentialsException("Username or newPassword is invalid", "INVALID_USER_OR_PASSWORD");
        }

        if (user.getStatus() != User.UserStatus.active) {
            throw new AccountNotActiveException("Your account is not active. Please verify your email or contact support for more information");
        }

        RefreshToken refreshToken = tokenService.createRefreshToken(user);

        return new AuthResult(user, refreshToken);
    }

    @Transactional
    public void logout(UUID userId, String refreshTokenStr, boolean allDevices) {
        if (allDevices) {
            tokenService.revokeRefreshTokensByUserId(userId);
        } else {
            tokenService.revokeRefreshTokenByToken(refreshTokenStr);
        }
    }

    public void forgotPassword(AuthDTO.ForgotPasswordRequest request) {
        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.email()));
        if (user.getStatus() != User.UserStatus.active) {
            throw new AccountNotActiveException("Your account is not active. Please verify your email or contact support for more information");
        }
        emailService.sendOtp(user.getEmail());
    }

    @Transactional
    public void resetPassword(AuthDTO.ResetPasswordRequest request) {
        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new UserNotFoundException("User not found with user email: " + request.email() + " to reset newPassword"));

        boolean isOptCodeValid = emailService.verifyOtpMailCode(request.email(), request.otp());
        if (!isOptCodeValid) throw new InvalidCredentialsException("Invalid OTP!");

        userService.updatePassword(user.getId(), request.newPassword());
        tokenService.revokeRefreshTokensByUserId(user.getId());
    }

    public OtpDTO.ResendResponse resendOtp(OtpDTO.ResendRequest request) {
        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.email()));
        if (user.getStatus() != User.UserStatus.pending_verification) {
            throw new AccountNotActiveException("Your account is not pending verification");
        }
        Instant sentDate = emailService.sendOtp(request.email());

        return new OtpDTO.ResendResponse(request.email(), sentDate.plusSeconds(5 * 60)); // OTP expires in 5 minutes
    }

    public void verifyEmail(OtpDTO.VerifyRequest request) {
        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new UserNotFoundException("User not found with user email: " + request.email() + " to update status"));

        boolean isOptCodeValid = emailService.verifyOtpMailCode(request.email(), request.otp());
        if (!isOptCodeValid) throw new InvalidCredentialsException("Invalid email or OTP!");


        userService.updateUserStatus(user.getId(), User.UserStatus.active);
    }

    public AuthDTO.AccessTokenResponse createAccessToken(String refreshTokenStr) {
        if (refreshTokenStr == null) throw new InvalidCredentialsException("Refresh token is null");

        RefreshToken validRefreshToken = tokenService.verifyRefreshToken(refreshTokenStr);
        UUID userId = validRefreshToken.getUser().getId();

        User user = userService.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with user ID: " + userId));

        if (user.getStatus() != User.UserStatus.active) {
            tokenService.revokeRefreshTokensByUserId(userId);
            throw new AccountNotActiveException("Your account is not active. Please verify your email or contact support for more information");
        }

        AuthDTO.AccessTokenResponse accessToken = tokenService.createAccessToken(user);
        tokenService.updateLastUsedAt(refreshTokenStr, accessToken.createdAt());

        return accessToken;
    }


    private boolean checkPassword(String rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }
}
