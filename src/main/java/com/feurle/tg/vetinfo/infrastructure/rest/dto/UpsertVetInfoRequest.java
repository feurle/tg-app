// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpsertVetInfoRequest(
    String name,
    String phone,
    @Email String email,
    String street,
    String city,
    String zip,
    boolean primary,
    @NotNull @Valid List<OfficeHourDto> officeHours) {}
