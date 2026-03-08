// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import java.util.List;
import java.util.Optional;

public interface TagRepository {
  List<Tag> findAll();

  Optional<Tag> findById(Long id);

  List<Tag> findAllById(Iterable<Long> ids);

  Tag save(Tag tag);

  void deleteById(Long id);
}
