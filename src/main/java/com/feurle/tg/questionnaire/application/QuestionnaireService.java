// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.application;

import com.feurle.tg.questionnaire.QuestionnaireSubmittedEvent;
import com.feurle.tg.questionnaire.domain.OwnerDetails;
import com.feurle.tg.questionnaire.domain.PetDetails;
import com.feurle.tg.questionnaire.domain.Questionnaire;
import com.feurle.tg.questionnaire.domain.QuestionnaireRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class QuestionnaireService {

  private final QuestionnaireRepository questionnaireRepository;
  private final ApplicationEventPublisher eventPublisher;

  public Questionnaire submit(OwnerDetails owner, PetDetails pet) {
    Questionnaire questionnaire = new Questionnaire();
    questionnaire.setOwner(owner);
    questionnaire.setPet(pet);
    Questionnaire saved = questionnaireRepository.save(questionnaire);
    log.info("submit: questionnaire {} submitted", saved.getId());
    eventPublisher.publishEvent(
        new QuestionnaireSubmittedEvent(
            saved.getId(),
            owner != null ? owner.getName() : null,
            pet != null ? pet.getName() : null));
    return saved;
  }

  @Transactional(readOnly = true)
  public List<Questionnaire> getAll() {
    return questionnaireRepository.findAll();
  }

  @Transactional(readOnly = true)
  public Questionnaire getById(Long id) {
    return questionnaireRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Questionnaire not found: " + id));
  }

  public void delete(Long id) {
    questionnaireRepository.deleteById(id);
  }
}
