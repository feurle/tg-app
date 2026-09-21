// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo;

import java.util.Optional;

/**
 * Public read-only lookup for the primary contact e-mail of the practice. This is the only piece of
 * the {@code vetinfo} module other modules (e.g. {@code contact}, {@code notification}) are allowed
 * to depend on.
 */
public interface PrimaryContactEmailLookup {

  Optional<String> primaryEmail();
}
