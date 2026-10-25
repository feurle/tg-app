// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.feurle.tg.vetinfo.WeeklyOfficeHour;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;

class AppointmentRulesTest {

  private static final ZoneId VIENNA = ZoneId.of("Europe/Vienna");

  /** Monday 2026-08-10, 15:10 in Vienna. */
  private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-08-10T13:10:00Z"), VIENNA);

  private static final LocalDate MONDAY = LocalDate.of(2026, 8, 10);
  private static final LocalDate TUESDAY = LocalDate.of(2026, 8, 11);
  private static final LocalDate WEDNESDAY = LocalDate.of(2026, 8, 12);

  private static final List<WeeklyOfficeHour> HOURS =
      List.of(
          new WeeklyOfficeHour(DayOfWeek.MONDAY, LocalTime.of(14, 0), LocalTime.of(18, 0)),
          new WeeklyOfficeHour(DayOfWeek.TUESDAY, LocalTime.of(8, 30), LocalTime.of(12, 30)),
          new WeeklyOfficeHour(DayOfWeek.TUESDAY, LocalTime.of(15, 0), LocalTime.of(16, 0)));

  private final AppointmentRules rules = new AppointmentRules(() -> HOURS, CLOCK);

  @Test
  void accepts_dayWithOfficeHoursAndNoTime() {
    assertThatCode(() -> rules.requireBookable(TUESDAY, null)).doesNotThrowAnyException();
  }

  @Test
  void accepts_firstAndLastSlotOfAnInterval() {
    assertThatCode(() -> rules.requireBookable(TUESDAY, LocalTime.of(8, 30)))
        .doesNotThrowAnyException();
    assertThatCode(() -> rules.requireBookable(TUESDAY, LocalTime.of(12, 0)))
        .doesNotThrowAnyException();
  }

  @Test
  void accepts_slotInSecondIntervalOfTheDay() {
    assertThatCode(() -> rules.requireBookable(TUESDAY, LocalTime.of(15, 30)))
        .doesNotThrowAnyException();
  }

  @Test
  void rejects_dayWithoutOfficeHours() {
    assertThatThrownBy(() -> rules.requireBookable(WEDNESDAY, null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void rejects_closingTimeAndTimesOutsideTheIntervals() {
    assertThatThrownBy(() -> rules.requireBookable(TUESDAY, LocalTime.of(12, 30)))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> rules.requireBookable(TUESDAY, LocalTime.of(13, 0)))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> rules.requireBookable(TUESDAY, LocalTime.of(8, 0)))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void rejects_timeNotOnTheSlotGrid() {
    assertThatThrownBy(() -> rules.requireBookable(TUESDAY, LocalTime.of(9, 10)))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void today_acceptsOnlyFutureSlots() {
    assertThatCode(() -> rules.requireBookable(MONDAY, LocalTime.of(15, 30)))
        .doesNotThrowAnyException();
    assertThatThrownBy(() -> rules.requireBookable(MONDAY, LocalTime.of(15, 0)))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void today_isRejectedOnceNoSlotIsLeft() {
    Clock late = Clock.fixed(Instant.parse("2026-08-10T15:45:00Z"), VIENNA); // 17:45 Vienna
    AppointmentRules lateRules = new AppointmentRules(() -> HOURS, late);

    assertThatThrownBy(() -> lateRules.requireBookable(MONDAY, null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void rejects_pastDate() {
    assertThatThrownBy(() -> rules.requireBookable(MONDAY.minusDays(1), null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void rejects_dateBeyondEightWeeks() {
    assertThatCode(() -> rules.requireBookable(MONDAY.plusWeeks(8), null))
        .doesNotThrowAnyException();
    assertThatThrownBy(() -> rules.requireBookable(TUESDAY.plusWeeks(8), null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void withoutOfficeHours_onlyPastDatesAreRejected() {
    AppointmentRules open = new AppointmentRules(List::of, CLOCK);

    assertThatCode(() -> open.requireBookable(WEDNESDAY, LocalTime.of(3, 7)))
        .doesNotThrowAnyException();
    assertThatThrownBy(() -> open.requireBookable(MONDAY.minusDays(1), null))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
