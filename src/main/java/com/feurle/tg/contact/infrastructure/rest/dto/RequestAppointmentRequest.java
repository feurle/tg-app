// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * {@code phone}, {@code preferredTime} and {@code text} are optional. {@code website} is a honeypot
 * field that real visitors never fill.
 */
public record RequestAppointmentRequest(
    @NotBlank String senderName,
    @Email @NotBlank String replyToEmail,
    String phone,
    @NotNull LocalDate preferredDate,
    LocalTime preferredTime,
    String text,
    String website) {}
