// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.questionnaire.domain.QuestionnaireRepository;
import com.feurle.tg.questionnaire.domain.Species;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.OwnerDto;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.PetDto;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.SubmitQuestionnaireRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

/**
 * The questionnaire is public: reachable without login, and bots that fill the honeypot are
 * dropped.
 */
@SpringBootTest
@TestPropertySource(
    properties = {
      "spring.jpa.hibernate.ddl-auto=create-drop",
      "management.health.mail.enabled=false"
    })
class QuestionnaireControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private QuestionnaireRepository questionnaireRepository;

  @MockitoBean private JavaMailSender mailSender;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
    questionnaireRepository.deleteAll();
  }

  @AfterEach
  void tearDown() {
    questionnaireRepository.deleteAll();
  }

  private SubmitQuestionnaireRequest request(String website) {
    PetDto pet =
        new PetDto(
            "Minka",
            Species.CAT,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    return new SubmitQuestionnaireRequest(
        new OwnerDto("Max Mustermann", null, null, null), pet, website);
  }

  @Test
  void submit_storesQuestionnaire_whenUnauthenticatedRequestIsValid() throws Exception {
    mockMvc
        .perform(
            post("/api/questionnaire")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request(null))))
        .andExpect(status().isCreated());

    assertThat(questionnaireRepository.findAll()).hasSize(1);
  }

  @Test
  void submit_returnsNoContentAndStoresNothing_whenHoneypotFieldIsFilled() throws Exception {
    mockMvc
        .perform(
            post("/api/questionnaire")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request("http://spam.example"))))
        .andExpect(status().isNoContent());

    assertThat(questionnaireRepository.findAll()).isEmpty();
  }
}
