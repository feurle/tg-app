// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.webcontent.domain.Tag;
import com.feurle.tg.webcontent.infrastructure.persistence.JpaTagRepository;
import com.feurle.tg.webcontent.infrastructure.rest.dto.CreateTagRequest;
import com.feurle.tg.webcontent.infrastructure.rest.dto.UpdateTagRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class TagControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private JpaTagRepository tagRepository;

  private Tag testTag;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    tagRepository.deleteAll();

    testTag = new Tag();
    testTag.setName("Spring");
    testTag = ((com.feurle.tg.webcontent.domain.TagRepository) tagRepository).save(testTag);
  }

  @AfterEach
  void tearDown() {
    tagRepository.deleteAll();
  }

  // ========== GET /api/webcontent/tags ==========

  @Test
  void getAllTags_returns200_withTagList() throws Exception {
    mockMvc
        .perform(get("/api/webcontent/tags").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].id", equalTo(testTag.getId().intValue())))
        .andExpect(jsonPath("$[0].name", equalTo("Spring")));
  }

  @Test
  void getAllTags_emptyDatabase_returns200_withEmptyList() throws Exception {
    tagRepository.deleteAll();

    mockMvc
        .perform(get("/api/webcontent/tags").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  // ========== GET /api/webcontent/tags/{id} ==========

  @Test
  void getTag_withValidId_returns200() throws Exception {
    mockMvc
        .perform(
            get("/api/webcontent/tags/{id}", testTag.getId())
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(testTag.getId().intValue())))
        .andExpect(jsonPath("$.name", equalTo("Spring")));
  }

  @Test
  void getTag_nonExistent_returns400() throws Exception {
    mockMvc
        .perform(get("/api/webcontent/tags/{id}", 999L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }

  // ========== POST /api/webcontent/tags ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createTag_withValidData_returns201() throws Exception {
    CreateTagRequest request = new CreateTagRequest("Kotlin");

    mockMvc
        .perform(
            post("/api/webcontent/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name", equalTo("Kotlin")))
        .andExpect(jsonPath("$.id", notNullValue()));

    assertThat(tagRepository.findAll()).hasSize(2);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createTag_duplicate_returns500() throws Exception {
    CreateTagRequest request = new CreateTagRequest("Spring"); // already exists

    mockMvc
        .perform(
            post("/api/webcontent/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isInternalServerError());
  }

  // ========== PUT /api/webcontent/tags/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateTag_withValidData_returns200() throws Exception {
    UpdateTagRequest request = new UpdateTagRequest("SpringBoot");

    mockMvc
        .perform(
            put("/api/webcontent/tags/{id}", testTag.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(testTag.getId().intValue())))
        .andExpect(jsonPath("$.name", equalTo("SpringBoot")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateTag_nonExistent_returns400() throws Exception {
    UpdateTagRequest request = new UpdateTagRequest("NewName");

    mockMvc
        .perform(
            put("/api/webcontent/tags/{id}", 999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  // ========== DELETE /api/webcontent/tags/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteTag_withValidId_returns204() throws Exception {
    mockMvc
        .perform(delete("/api/webcontent/tags/{id}", testTag.getId()))
        .andExpect(status().isNoContent());

    assertThat(tagRepository.findAll()).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteTag_nonExistent_returns204() throws Exception {
    mockMvc
        .perform(delete("/api/webcontent/tags/{id}", 999L))
        .andExpect(status().isNoContent());
  }
}
