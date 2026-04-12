// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;
import org.springframework.modulith.test.ApplicationModuleTest;

@ApplicationModuleTest
class WebContentModuleTests {

  @Test
  void moduleStructureIsValid() {
    ApplicationModules modules = ApplicationModules.of(com.feurle.tg.Application.class);
    modules.verify();
    assertThat(modules.stream()).isNotEmpty();
  }

  @Test
  void createModuleDocumentation() {
    ApplicationModules modules = ApplicationModules.of(com.feurle.tg.Application.class);
    assertDoesNotThrow((org.junit.jupiter.api.function.Executable) () -> new Documenter(modules).writeDocumentation());
  }
}
