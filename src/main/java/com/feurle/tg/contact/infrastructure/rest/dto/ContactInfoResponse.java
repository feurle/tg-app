// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ContactInfoResponse(
    Long id,
    String name,
    String phone,
    String email,
    String street,
    String city,
    String zip,
    boolean primary,
    List<OfficeHourDto> officeHours,
    LocalDateTime updatedAt) {}
