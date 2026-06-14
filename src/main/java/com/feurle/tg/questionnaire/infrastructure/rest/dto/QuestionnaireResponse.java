// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.rest.dto;

import java.time.LocalDateTime;

public record QuestionnaireResponse(
    Long id, OwnerDto owner, PetDto pet, LocalDateTime submittedAt) {}
