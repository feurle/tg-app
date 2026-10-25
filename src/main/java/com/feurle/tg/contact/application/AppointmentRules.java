// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.vetinfo.OfficeHoursLookup;
import com.feurle.tg.vetinfo.WeeklyOfficeHour;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Decides whether a requested appointment falls into the practice's office hours. Slots start at
 * each opening time in 30 minute steps, the last one ends at closing time. Requests are limited to
 * the next 8 weeks. "Now" is evaluated in Europe/Vienna time. Without maintained office hours only
 * past dates are rejected.
 */
@Component
public class AppointmentRules {

  static final int SLOT_MINUTES = 30;
  static final int BOOKING_WEEKS = 8;
  private static final ZoneId PRACTICE_ZONE = ZoneId.of("Europe/Vienna");

  private final OfficeHoursLookup officeHoursLookup;
  private final Clock clock;

  @Autowired
  public AppointmentRules(OfficeHoursLookup officeHoursLookup) {
    this(officeHoursLookup, Clock.system(PRACTICE_ZONE));
  }

  AppointmentRules(OfficeHoursLookup officeHoursLookup, Clock clock) {
    this.officeHoursLookup = officeHoursLookup;
    this.clock = clock;
  }

  /**
   * @throws IllegalArgumentException if the date or time is not bookable
   */
  public void requireBookable(LocalDate date, LocalTime time) {
    LocalDateTime now = LocalDateTime.now(clock);
    LocalDate today = now.toLocalDate();
    if (date.isBefore(today)) {
      throw new IllegalArgumentException("Preferred date must not be in the past");
    }
    List<WeeklyOfficeHour> hours = officeHoursLookup.primaryOfficeHours();
    if (hours.isEmpty()) {
      return;
    }
    if (date.isAfter(today.plusWeeks(BOOKING_WEEKS))) {
      throw new IllegalArgumentException(
          "Preferred date must be within the next " + BOOKING_WEEKS + " weeks");
    }
    List<LocalTime> slots = slots(hours, date);
    if (date.equals(today)) {
      slots = slots.stream().filter(slot -> slot.isAfter(now.toLocalTime())).toList();
    }
    if (slots.isEmpty()) {
      throw new IllegalArgumentException("No office hours on the preferred date");
    }
    if (time != null && !slots.contains(time)) {
      throw new IllegalArgumentException("Preferred time is outside the office hours");
    }
  }

  private static List<LocalTime> slots(List<WeeklyOfficeHour> hours, LocalDate date) {
    return hours.stream()
        .filter(h -> h.dayOfWeek() == date.getDayOfWeek())
        .flatMap(
            h -> {
              int close = h.closesAt().toSecondOfDay() / 60;
              return Stream.iterate(
                      h.opensAt().toSecondOfDay() / 60,
                      m -> m + SLOT_MINUTES <= close,
                      m -> m + SLOT_MINUTES)
                  .map(m -> LocalTime.of(m / 60, m % 60));
            })
        .sorted()
        .toList();
  }
}
