// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.webcontent.infrastructure.persistence.JpaTagRepository;
import com.feurle.tg.webcontent.infrastructure.rest.dto.CreateTagRequest;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class GlobalExceptionHandlerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private JpaTagRepository tagRepository;

  private MockMvc mockMvc;
  private MockMvc standaloneMvc;

  /**
   * Minimal test controller to trigger exception types that are hard to provoke via the real API
   */
  @RestController
  static class ExceptionTriggerController {

    @GetMapping("/test/no-such-element")
    public void throwNoSuchElement() {
      throw new NoSuchElementException("test element not found");
    }

    @GetMapping("/test/runtime-exception")
    public void throwRuntimeException() {
      throw new RuntimeException("unexpected test error");
    }
  }

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    standaloneMvc =
        standaloneSetup(new ExceptionTriggerController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    tagRepository.deleteAll();
  }

  @AfterEach
  void tearDown() {
    tagRepository.deleteAll();
  }

  // ========== handleDataIntegrityViolation ==========

  @Test
  void createDuplicateTag_returns500_dataIntegrityViolation() throws Exception {
    // Create first tag
    CreateTagRequest request = new CreateTagRequest("UniqueTag");
    mockMvc
        .perform(
            post("/api/webcontent/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());

    // Create duplicate – triggers DataIntegrityViolationException
    mockMvc
        .perform(
            post("/api/webcontent/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.status", equalTo(500)))
        .andExpect(jsonPath("$.error", equalTo("Internal Server Error")));
  }

  // ========== handleHttpMessageNotReadable ==========

  @Test
  void malformedJson_returns400_httpMessageNotReadable() throws Exception {
    mockMvc
        .perform(
            post("/api/webcontent/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid-json"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status", equalTo(400)))
        .andExpect(jsonPath("$.message", equalTo("Invalid request format")));
  }

  // ========== handleNoSuchElement ==========

  @Test
  void noSuchElementException_returns404() throws Exception {
    standaloneMvc
        .perform(get("/test/no-such-element"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.status", equalTo(404)))
        .andExpect(jsonPath("$.error", equalTo("Not Found")));
  }

  // ========== handleGlobalException ==========

  @Test
  void unexpectedException_returns500() throws Exception {
    standaloneMvc
        .perform(get("/test/runtime-exception"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.status", equalTo(500)))
        .andExpect(jsonPath("$.error", equalTo("Internal Server Error")))
        .andExpect(jsonPath("$.message", equalTo("An unexpected error occurred")));
  }
}
