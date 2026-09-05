package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsUserByUsername(String username);

    boolean existsUserByEmail(String email);

    @Modifying
    @Query("update User s set s.password = :newHashPassword, s.updatedAt = current_timestamp where s.id = :id")
    int updatePassword(@Param("id") UUID id, @Param("newHashPassword") String newHashPassword);

    @Modifying
    @Query("update User s set s.status = :status, s.updatedAt = current_timestamp where s.id = :id")
    int updateStatus(@Param("id") UUID id, @Param("status") User.UserStatus status);

    @Modifying
    @Query("delete from User s where s.id = :id")
    int deleteByIdDirectly(@Param("id") UUID id);
}
