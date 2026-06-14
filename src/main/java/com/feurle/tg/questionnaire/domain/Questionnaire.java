// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.domain;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Aggregate root for a behavior-consultation intake questionnaire (Erhebungsbogen). Submitted by a
 * pet owner; persisted for the practice to review.
 */
@Entity
@Data
@NoArgsConstructor
public class Questionnaire {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Embedded private OwnerDetails owner;

  @Embedded private PetDetails pet;

  private LocalDateTime submittedAt;

  @PrePersist
  void stamp() {
    submittedAt = LocalDateTime.now();
  }
}
