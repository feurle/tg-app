// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import java.util.List;
import java.util.Optional;

public interface PageRepository {
  List<Page> findAll();

  Optional<Page> findById(Long id);

  Optional<Page> findBySlug(String slug);

  Page save(Page page);

  void deleteById(Long id);

  boolean existsBySlug(String slug);
}
