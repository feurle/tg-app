// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo;

import java.time.DayOfWeek;
import java.time.LocalTime;

/** One opening interval of the practice on one weekday, as exposed to other modules. */
public record WeeklyOfficeHour(DayOfWeek dayOfWeek, LocalTime opensAt, LocalTime closesAt) {}
