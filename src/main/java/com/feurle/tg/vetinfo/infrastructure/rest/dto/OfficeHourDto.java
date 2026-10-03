// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest.dto;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record OfficeHourDto(
    @NotNull DayOfWeek dayOfWeek, @NotNull LocalTime opensAt, @NotNull LocalTime closesAt) {}
