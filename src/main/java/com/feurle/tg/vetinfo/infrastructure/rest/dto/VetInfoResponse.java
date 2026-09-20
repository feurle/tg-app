// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest.dto;

import java.time.LocalDateTime;
import java.util.List;

public record VetInfoResponse(
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
