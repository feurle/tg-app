// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.rest;

import com.feurle.tg.questionnaire.application.QuestionnaireService;
import com.feurle.tg.questionnaire.domain.Questionnaire;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.QuestionnaireResponse;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.SubmitQuestionnaireRequest;
import com.feurle.tg.questionnaire.infrastructure.rest.mapper.QuestionnaireMapper;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/questionnaire")
@RequiredArgsConstructor
@Slf4j
public class QuestionnaireController {

  private final QuestionnaireService questionnaireService;
  private final QuestionnaireMapper questionnaireMapper;

  /** Public: a pet owner submits the intake questionnaire. */
  @PostMapping
  public ResponseEntity<QuestionnaireResponse> submit(
      @Valid @RequestBody SubmitQuestionnaireRequest request) {
    log.info("submit: POST /api/questionnaire");
    Questionnaire saved =
        questionnaireService.submit(
            questionnaireMapper.toDomain(request.owner()),
            questionnaireMapper.toDomain(request.pet()));
    return ResponseEntity.status(HttpStatus.CREATED).body(questionnaireMapper.toResponse(saved));
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<QuestionnaireResponse>> getAll() {
    return ResponseEntity.ok(
        questionnaireService.getAll().stream().map(questionnaireMapper::toResponse).toList());
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<QuestionnaireResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(questionnaireMapper.toResponse(questionnaireService.getById(id)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    questionnaireService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
