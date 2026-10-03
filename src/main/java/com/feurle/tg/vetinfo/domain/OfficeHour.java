// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.DayOfWeek;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One opening interval on one weekday. A day with two intervals has two entries. */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfficeHour {

  @Enumerated(EnumType.STRING)
  @Column(name = "day_of_week")
  private DayOfWeek dayOfWeek;

  @Column(name = "opens_at")
  private LocalTime opensAt;

  @Column(name = "closes_at")
  private LocalTime closesAt;
}
