// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.rest.dto;

import jakarta.validation.constraints.NotBlank;

public record PetDto(
    @NotBlank String name,
    String origin,
    String breederRearing,
    String historyBeforeOwner,
    String ageWhenAcquired,
    String ownedSince,
    Boolean neutered,
    String neuteredAge,
    String neuteringReason,
    String behaviorChangesAfterNeutering,
    String school,
    String knownCommands,
    String feeding,
    String supplements,
    String digestion,
    String lastDeworming,
    String bloodTest) {}
