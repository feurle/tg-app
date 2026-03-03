// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.domain.repository;

import com.feurle.tg.user.domain.entity.Authority;
import java.util.Optional;

public interface AuthorityRepository {
  Optional<Authority> findByName(String name);
}
