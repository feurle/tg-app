package com.feurle.tg.user.domain.repository;

import com.feurle.tg.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLogin(String login);

    Optional<User> findByEmail(String email);

    Optional<User> findByActivationKey(String activationKey);

    Optional<User> findByResetKey(String resetKey);

    boolean existsByLogin(String login);

    boolean existsByEmail(String email);
}
