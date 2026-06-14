// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Value object: "Allgemeine Fragen zu Ihrem Hund" — general details about the pet. */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDetails {

  /** 1. Tiername. */
  @Column(name = "pet_name")
  private String name;

  /** 2. Herkunft des Tieres. */
  @Column(name = "pet_origin", columnDefinition = "TEXT")
  private String origin;

  /** 2a. Falls vom Züchter: Haltung, Aufzucht, Elterntiere gesehen? */
  @Column(name = "pet_breeder_rearing", columnDefinition = "TEXT")
  private String breederRearing;

  /** 2b. Falls nicht erster Besitzer: Vergangenheit vor der Übernahme. */
  @Column(name = "pet_history_before_owner", columnDefinition = "TEXT")
  private String historyBeforeOwner;

  /** 3. Wie alt war das Tier bei der Übernahme? */
  @Column(name = "pet_age_when_acquired")
  private String ageWhenAcquired;

  /** 4. Seit wann lebt das Tier beim Halter? */
  @Column(name = "pet_owned_since")
  private String ownedSince;

  /** 5. Ist das Tier kastriert? */
  @Column(name = "pet_neutered")
  private Boolean neutered;

  /** 5a. In welchem Alter wurde kastriert? */
  @Column(name = "pet_neutered_age")
  private String neuteredAge;

  /** 5b. Gab es einen speziellen Grund für die Kastration? */
  @Column(name = "pet_neutering_reason", columnDefinition = "TEXT")
  private String neuteringReason;

  /** 5c. Traten Verhaltensänderungen nach der Kastration auf? */
  @Column(name = "pet_behavior_changes_after_neutering", columnDefinition = "TEXT")
  private String behaviorChangesAfterNeutering;

  /** 6. Hundeschule / eigene Ausbildung / Hilfsmittel (z.B. Clicker). */
  @Column(name = "pet_school", columnDefinition = "TEXT")
  private String school;

  /** 6a. Bekannte Kommandos (z.B. Sitz, Platz, Aus). */
  @Column(name = "pet_known_commands", columnDefinition = "TEXT")
  private String knownCommands;

  /** 7. Was bekommt das Tier, wie oft zu fressen? */
  @Column(name = "pet_feeding", columnDefinition = "TEXT")
  private String feeding;

  /** 8. Bekommt das Tier Nahrungsergänzungsmittel? */
  @Column(name = "pet_supplements", columnDefinition = "TEXT")
  private String supplements;

  /** 9. Wie oft Kot? Magen-Darm-Probleme? */
  @Column(name = "pet_digestion", columnDefinition = "TEXT")
  private String digestion;

  /** 10. Wann wurde zuletzt entwurmt? */
  @Column(name = "pet_last_deworming")
  private String lastDeworming;

  /** 11. Blutuntersuchung erfolgt? Auffälligkeiten? */
  @Column(name = "pet_blood_test", columnDefinition = "TEXT")
  private String bloodTest;
}
