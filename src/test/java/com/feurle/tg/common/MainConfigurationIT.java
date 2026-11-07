// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import static org.assertj.core.api.Assertions.assertThat;

import de.codecentric.boot.admin.client.registration.ApplicationRegistrator;
import jakarta.servlet.MultipartConfigElement;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.TestPropertySource;

/**
 * Tests run against src/main/resources/application.yaml with the junit profile on top
 * (application-junit.yaml), so a broken setting in the main file fails here and not on TEST.
 */
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class MainConfigurationIT {

  @Autowired private Environment environment;

  @Autowired private ApplicationContext context;

  @Test
  void applicationNameComesFromMainFile() {
    assertThat(environment.getProperty("spring.application.name")).isEqualTo("tg-app");
  }

  @Test
  void uploadLimitComesFromMainFile() {
    MultipartConfigElement multipart = context.getBean(MultipartConfigElement.class);

    assertThat(multipart.getMaxFileSize()).isEqualTo(10L * 1024 * 1024);
  }

  @Test
  void junitProfileOverridesRateLimit() {
    assertThat(environment.getProperty("app.rate-limit.max-requests")).isEqualTo("1000");
  }

  @Test
  void junitProfileTurnsOffAdminClient() {
    assertThat(context.getBeansOfType(ApplicationRegistrator.class)).isEmpty();
  }
}
