// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Cache headers of the frontend files. Runs with the security filter chain, which would otherwise
 * mark every response "no-store". Uses the seed data. {@code static/assets/cache-test.js} is a test
 * fixture; the real assets have a content hash in their name.
 */
@SpringBootTest
class StaticResourceCachingIT {

  @Autowired private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc() {
    return MockMvcBuilders.webAppContextSetup(webApplicationContext)
        .apply(springSecurity())
        .build();
  }

  @Test
  void hashedAssetsAreCachedForAYear() throws Exception {
    mockMvc()
        .perform(get("/assets/cache-test.js"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "max-age=31536000, public, immutable"))
        .andExpect(header().doesNotExist("Pragma"))
        .andExpect(header().doesNotExist("Expires"));
  }

  @Test
  void indexHtmlIsRevalidatedButNotStoreBlocked() throws Exception {
    mockMvc()
        .perform(get("/index.html"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-cache"))
        .andExpect(header().exists("Last-Modified"));
  }

  @Test
  void apiResponsesStayUncached() throws Exception {
    mockMvc()
        .perform(get("/api/webcontent/pages/home"))
        .andExpect(status().isOk())
        .andExpect(
            header().string("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"));
  }
}
