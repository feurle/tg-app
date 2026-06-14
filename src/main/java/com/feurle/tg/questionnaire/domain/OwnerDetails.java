// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Value object: "Fragen zum Hundehalter" — details about the pet owner. */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDetails {

  /** 1. Name, Vorname. */
  @Column(name = "owner_name")
  private String name;

  /** Optional contact e-mail (not on the paper form) so the practice can reply / be notified. */
  @Column(name = "owner_email")
  private String email;

  /** 2. Ist das Ihr erster Hund? */
  @Column(name = "owner_first_pet")
  private Boolean firstPet;

  /** 3. Warum haben Sie sich gerade für dieses Tier entschieden? */
  @Column(name = "owner_reason_for_choosing", columnDefinition = "TEXT")
  private String reasonForChoosing;
}
