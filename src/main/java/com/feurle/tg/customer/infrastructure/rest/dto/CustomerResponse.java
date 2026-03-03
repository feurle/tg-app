// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.customer.infrastructure.rest.dto;

import java.time.LocalDateTime;

public record CustomerResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String address,
    String city,
    String state,
    String zip,
    String country,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {}
