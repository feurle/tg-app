// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.persistence;

import com.feurle.tg.questionnaire.domain.Questionnaire;
import com.feurle.tg.questionnaire.domain.QuestionnaireRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaQuestionnaireRepository
    extends JpaRepository<Questionnaire, Long>, QuestionnaireRepository {

  List<Questionnaire> findAllByOrderBySubmittedAtDesc();

  @Override
  default List<Questionnaire> findAll() {
    return findAllByOrderBySubmittedAtDesc();
  }
}
