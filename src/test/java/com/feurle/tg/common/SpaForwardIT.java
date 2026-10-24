// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/** Reload and deep links on client-side routes must serve the SPA, not a 401. */
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class SpaForwardIT {

  @Autowired private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc() {
    return MockMvcBuilders.webAppContextSetup(webApplicationContext)
        .apply(springSecurity())
        .build();
  }

  @Test
  void clientRouteForwardsToIndexHtml() throws Exception {
    mockMvc().perform(get("/treatments")).andExpect(forwardedUrl("/index.html"));
  }

  @Test
  void nestedClientRouteForwardsToIndexHtml() throws Exception {
    mockMvc().perform(get("/admin/articles/42")).andExpect(forwardedUrl("/index.html"));
  }

  @Test
  void unknownClientRouteForwardsSoFrontendCanShow404() throws Exception {
    mockMvc().perform(get("/nonexistent")).andExpect(forwardedUrl("/index.html"));
  }

  @Test
  void protectedApiPathStaysDenied() throws Exception {
    mockMvc().perform(get("/api/webcontent/pages")).andExpect(status().isForbidden());
  }

  @Test
  void unknownApiPathIsNotForwardedToIndexHtml() throws Exception {
    mockMvc().perform(get("/api/nonexistent")).andExpect(status().isForbidden());
  }
}
