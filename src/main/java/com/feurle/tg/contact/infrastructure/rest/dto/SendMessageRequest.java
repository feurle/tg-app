// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
    @NotBlank String title, @NotBlank String text, @Email @NotBlank String replyToEmail, @NotBlank String senderName) {}
