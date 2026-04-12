// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.test.ApplicationModuleTest;

@ApplicationModuleTest
class ContactModuleTest {

  @Test
  void verifyModuleStructure() {
    ApplicationModules modules = ApplicationModules.of(com.feurle.tg.Application.class);
    modules.verify();
  }
}
