// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.domain.repository;

import com.feurle.tg.user.domain.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByLogin(String login);

  Optional<User> findByEmail(String email);

  Optional<User> findByActivationKey(String activationKey);

  Optional<User> findByResetKey(String resetKey);

  boolean existsByLogin(String login);

  boolean existsByEmail(String email);
}
