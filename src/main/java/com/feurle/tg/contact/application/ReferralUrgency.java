// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

/** How soon a referred patient should be seen. */
public enum ReferralUrgency {
  ROUTINE("Routine"),
  SOON("zeitnah"),
  URGENT("dringend");

  private final String label;

  ReferralUrgency(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
