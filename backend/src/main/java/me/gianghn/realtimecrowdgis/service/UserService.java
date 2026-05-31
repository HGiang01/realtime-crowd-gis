package me.gianghn.realtimecrowdgis.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.dto.UserDTO;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.exception.specify.InvalidCredentialsException;
import me.gianghn.realtimecrowdgis.exception.specify.UserAlreadyExistsException;
import me.gianghn.realtimecrowdgis.exception.specify.UserNotFoundException;
import me.gianghn.realtimecrowdgis.mapper.UserMapper;
import me.gianghn.realtimecrowdgis.repository.RefreshTokenRepository;
import me.gianghn.realtimecrowdgis.repository.UserAuthProviderRepository;
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
    private final UserAuthProviderRepository userAuthProviderRepository;
    private final UserMapper userMapper;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;

    public UserDTO.GetMeResponse getMe(UUID userId) {
        User user = userRepository.getMe(userId);
        return userMapper.toGetMeResponse(user);
    }

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

    public User createTempUser(User user) {
        user.setPassword(encodePassword(user.getPassword()));
        userRepository.save(user);
        // test: kiểm tra lại ngày sinh của user đăng ký có hợp lệ dạng dd/mm/yyyy không ?
        return user;
    }

    @Transactional
    public int updatePassword(UUID userId, String newPassword) {
        return userRepository.updatePassword(userId, encodePassword(newPassword));
    }

    @Transactional
    public int updateUserStatus(UserDTO.UpdateStatusRequest request) {
        return userRepository.updateStatus(request.userId(), request.status());
    }

    @Transactional
    public void updateUserStatus(UUID userId, User.UserStatus status) {
        userRepository.updateStatus(userId, status);
    }

    @Transactional
    public User updateUserProfile(UserDTO.UpdateProfileRequest request) {
        User existingUser = userRepository.findById(request.userId())
                                          .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + request.userId() + " to update"));


        if (request.username() != null && userRepository.existsUserByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username is already in use!");
        }

        if (request.email() != null && userRepository.existsUserByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email is already in use!");
        } else {
            existingUser.setStatus(User.UserStatus.pending_verification);
        }

        userMapper.updateUserFromDTO(request, existingUser);

        return userRepository.save(existingUser);
        // test: kiểm tra lại dob và updated_at field
    }


    @Transactional
    public void updateUserPassword(UserDTO.UpdatePasswordRequest request) {
        User existingUser = userRepository.findById(request.userId())
                                          .orElseThrow(() -> new UserNotFoundException("User not found with user id: " + request.userId() + " to update"));

        // test: kiểm tra xem password có bị null không ? (trường hợp user đăng ký bằng oauth2 thì password sẽ null)
        if (existingUser.getPassword() == null) {
            throw new UserNotFoundException("Password is already in use!");
        }

        if (!checkPassword(request.currentPassword(), existingUser.getPassword())) {
            throw new InvalidCredentialsException("Current password is invalid!");
        }

        existingUser.setPassword(encodePassword(request.newPassword()));
        userRepository.save(existingUser);

        refreshTokenRepository.deleteAllByUserId(existingUser.getId());
    }

    @Transactional
    public void deleteUserByUserId(UserDTO.DeleteRequest request) {
        userRepository.deleteByIdDirectly(request.userId());
    }

    private String encodePassword(String rawPassword) {
        return new BCryptPasswordEncoder().encode(rawPassword);
    }

    private boolean checkPassword(String rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }
}
