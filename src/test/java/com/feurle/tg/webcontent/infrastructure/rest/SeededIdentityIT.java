// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.infrastructure.persistence.JpaArticleRepository;
import com.feurle.tg.webcontent.infrastructure.persistence.JpaSectionRepository;
import com.feurle.tg.webcontent.infrastructure.rest.dto.CreateTagRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

/**
 * Runs against the Liquibase schema and seed (no create-drop). The seed CSVs insert explicit IDs,
 * so generated IDs must start above them.
 */
@SpringBootTest
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:seeded-identity")
@Transactional
class SeededIdentityIT {

  @Autowired private WebApplicationContext webApplicationContext;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private JpaSectionRepository sectionRepository;
  @Autowired private JpaArticleRepository articleRepository;

  @Test
  @WithMockUser(roles = "ADMIN")
  void createTag_afterSeed_returns201() throws Exception {
    webAppContextSetup(webApplicationContext)
        .build()
        .perform(
            post("/api/webcontent/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateTagRequest("Kotlin"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id", greaterThan(15)));
  }

  @Test
  void createSection_afterSeed_getsIdAboveSeededSections() {
    long maxSeededId =
        sectionRepository.findAll().stream().mapToLong(Section::getId).max().orElseThrow();

    Section section = new Section();
    section.setTitle("New");
    section.setArticle(articleRepository.findAll().getFirst());

    assertThat(sectionRepository.saveAndFlush(section).getId()).isGreaterThan(maxSeededId);
  }
}
