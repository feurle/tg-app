// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.config;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Now that Spring Boot serves the frontend itself (no more nginx in front, see
 * docs/adr/0001-single-container-deployment.md), the security headers nginx used to set must come
 * from Spring Security instead.
 */
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class SecurityHeadersIT {

  @Autowired private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc() {
    return MockMvcBuilders.webAppContextSetup(webApplicationContext)
        .apply(springSecurity())
        .build();
  }

  @Test
  void publicRouteExposesNosniffHeader() throws Exception {
    mockMvc()
        .perform(get("/actuator/health"))
        .andExpect(header().string("X-Content-Type-Options", "nosniff"));
  }

  @Test
  void publicRouteExposesReferrerPolicyHeader() throws Exception {
    mockMvc()
        .perform(get("/actuator/health"))
        .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
  }

  @Test
  void secureRequestExposesHstsHeader() throws Exception {
    mockMvc()
        .perform(get("/actuator/health").secure(true))
        .andExpect(
            header().string("Strict-Transport-Security", "max-age=31536000 ; includeSubDomains"));
  }
}
