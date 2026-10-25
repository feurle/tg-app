// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo;

import java.util.List;

/** Public read-only lookup for the weekly office hours of the primary practice. */
public interface OfficeHoursLookup {

  /** Opening intervals of the primary practice; empty if none are maintained. */
  List<WeeklyOfficeHour> primaryOfficeHours();
}
