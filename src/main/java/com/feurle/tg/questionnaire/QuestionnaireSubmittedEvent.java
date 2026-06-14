// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire;

/**
 * Published when a questionnaire is submitted. Lives in the module root package so it is part of
 * the questionnaire module's public API and other modules (e.g. contact) may listen to it.
 */
public record QuestionnaireSubmittedEvent(Long questionnaireId, String ownerName, String petName) {}
