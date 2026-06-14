// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.domain;

import java.util.List;
import java.util.Optional;

public interface QuestionnaireRepository {

  Questionnaire save(Questionnaire questionnaire);

  /** Newest submissions first. */
  List<Questionnaire> findAll();

  Optional<Questionnaire> findById(Long id);

  void deleteById(Long id);

  void deleteAll();
}
