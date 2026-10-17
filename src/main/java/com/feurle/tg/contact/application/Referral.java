// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

/**
 * A patient referral from another vet. Optional fields may be {@code null} or blank. Only ever
 * mailed, never persisted.
 */
public record Referral(
    String referringPractice,
    String referringVetName,
    String referringEmail,
    String referringPhone,
    String ownerName,
    String ownerContact,
    String patientName,
    String species,
    String breed,
    String age,
    String question,
    String previousTreatment,
    ReferralUrgency urgency) {}
