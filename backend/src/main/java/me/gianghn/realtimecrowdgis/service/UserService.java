package me.gianghn.realtimecrowdgis.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.dto.UserDTO;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.exception.specify.*;
import me.gianghn.realtimecrowdgis.mapper.UserMapper;
import me.gianghn.realtimecrowdgis.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserAuthProviderService userAuthProviderService;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    public boolean existsUserByUsername(String username) {
        return userRepository.existsUserByUsername(username);
    }

    public boolean existsUserByEmail(String email) {
        return userRepository.existsUserByEmail(email);
    }

    public Optional<User> findById(UUID userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserDTO.GetMeResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + userId));
        return userMapper.toGetMeResponse(user);
    }

    public UserDTO.GetUserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + userId));

        return userMapper.toGetUserResponse(user);
    }

    public User createTempUser(User user) {
        user.setPassword(encodePassword(user.getPassword()));
        userRepository.save(user);
        return user;
    }

    @Transactional
    public int updatePassword(UUID userId, String newPassword) {
        return userRepository.updatePassword(userId, encodePassword(newPassword));
    }

    @Transactional
    public void updateUserStatus(UUID userId, User.UserStatus status) {
        userRepository.updateStatus(userId, status);
    }

    @Transactional
    public void updateUserProfile(UUID userId, UserDTO.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + userId + " to update"));


        if (request.username() != null && userRepository.existsUserByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username is already in use!");
        }

        userMapper.updateUserFromDTO(request, user);
        userRepository.save(user);
    }


    @Transactional
    public void updateUserPassword(UUID userId, UserDTO.UpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + userId + " to update"));

        if (user.getPassword() != null && !checkPassword(request.currentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is invalid!");
        }

        if (user.getPassword() == null && userAuthProviderService.findByUserId(userId).isEmpty()) {
            throw new IllegalAccountStateException("Password is required. No linked social accounts found.");
        }

        user.setPassword(encodePassword(request.newPassword()));
        userRepository.save(user);

        tokenService.revokeRefreshTokensByUserId(user.getId());
    }

    @Transactional
    public void updateUserStatus(UUID userId, UserDTO.UpdateStatusRequest request) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + userId + " to delete"));

        if (user.getRole() == User.UserRole.admin) {
            throw new PermissionDeniedException("Insufficient permissions to change the status of an administrator account.");
        }

        if (request.status() != User.UserStatus.active) {
            tokenService.revokeRefreshTokensByUserId(userId);
        }

        userRepository.updateStatus(userId, request.status());
    }

    @Transactional
    public void notifyUser(UUID userId, UserDTO.NotifyRequest request) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + userId + " to notify"));

        String toEmail = user.getEmail();
        emailService.sendNotification(toEmail, request.subject(), request.content(), request.notes());
    }

    @Transactional
    public void deleteUserByUserId(UUID userId) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + userId + " to delete"));

        if (user.getRole() == User.UserRole.admin) {
            throw new PermissionDeniedException("Insufficient permissions to delete an administrator account.");
        }

        tokenService.revokeRefreshTokensByUserId(userId);
        userRepository.deleteByIdDirectly(userId);
    }

    private String encodePassword(String rawPassword) {
        return new BCryptPasswordEncoder().encode(rawPassword);
    }

    private boolean checkPassword(String rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }
}
