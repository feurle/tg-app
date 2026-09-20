// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest.dto;

import jakarta.validation.constraints.NotBlank;

public record OfficeHourDto(@NotBlank String label, @NotBlank String hours) {}
