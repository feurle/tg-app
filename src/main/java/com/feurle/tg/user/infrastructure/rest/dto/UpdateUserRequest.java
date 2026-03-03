// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record UpdateUserRequest(
    @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,
    String password,
    String firstName,
    String lastName,
    String langKey,
    String imageUrl,
    Boolean activated,
    Set<String> authorities) {}
