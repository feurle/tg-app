// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import java.util.Optional;

public interface SectionRepository {
  Optional<Section> findById(Long id);

  Section save(Section section);

  void deleteById(Long id);
}
