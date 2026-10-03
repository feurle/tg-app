// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest.dto;

import com.feurle.tg.contact.application.ReferralUrgency;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * {@code referringPhone}, {@code patientName}, {@code breed}, {@code age} and {@code
 * previousTreatment} are optional. {@code ownerConsent} confirms that the owner agreed to pass on
 * their contact details. {@code website} is a honeypot field that real visitors never fill.
 */
public record RequestReferralRequest(
    @NotBlank String referringPractice,
    @NotBlank String referringVetName,
    @Email @NotBlank String referringEmail,
    String referringPhone,
    @NotBlank String ownerName,
    @NotBlank String ownerContact,
    String patientName,
    @NotBlank String species,
    String breed,
    String age,
    @NotBlank String question,
    String previousTreatment,
    @NotNull ReferralUrgency urgency,
    @AssertTrue boolean ownerConsent,
    String website) {}
