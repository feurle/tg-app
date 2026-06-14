// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record SubmitQuestionnaireRequest(
    @NotNull @Valid OwnerDto owner, @NotNull @Valid PetDto pet) {}
