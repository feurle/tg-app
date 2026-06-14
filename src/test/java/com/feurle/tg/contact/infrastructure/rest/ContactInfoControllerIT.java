// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.contact.application.ContactInfoService;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import com.feurle.tg.contact.domain.OfficeHour;
import com.feurle.tg.contact.infrastructure.rest.dto.OfficeHourDto;
import com.feurle.tg.contact.infrastructure.rest.dto.UpsertContactInfoRequest;
import java.util.List;
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
class ContactInfoControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private ContactInfoRepository contactInfoRepository;

  @Autowired private ContactInfoService contactInfoService;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    contactInfoRepository.deleteAll();
  }

  @AfterEach
  void tearDown() {
    contactInfoRepository.deleteAll();
  }

  // ========== GET /api/contact/info ==========

  @Test
  void getContactInfo_returnsNoContent_whenEmpty() throws Exception {
    mockMvc.perform(get("/api/contact/info")).andExpect(status().isNoContent());
  }

  @Test
  void getContactInfo_returnsOk_withData() throws Exception {
    contactInfoService.upsertContactInfo(
        "Tiergesund Praxis",
        "+49 89 123456",
        "praxis@example.de",
        "Musterstr. 1",
        "München",
        "80331",
        List.of(new OfficeHour("Montag – Freitag", "09:00 – 18:00")));

    mockMvc
        .perform(get("/api/contact/info"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.phone", equalTo("+49 89 123456")))
        .andExpect(jsonPath("$.email", equalTo("praxis@example.de")))
        .andExpect(jsonPath("$.street", equalTo("Musterstr. 1")))
        .andExpect(jsonPath("$.city", equalTo("München")))
        .andExpect(jsonPath("$.zip", equalTo("80331")))
        .andExpect(jsonPath("$.officeHours", hasSize(1)))
        .andExpect(jsonPath("$.officeHours[0].label", equalTo("Montag – Freitag")))
        .andExpect(jsonPath("$.officeHours[0].hours", equalTo("09:00 – 18:00")));
  }

  @Test
  void getContactInfo_isPublic_withoutAuth() throws Exception {
    mockMvc
        .perform(get("/api/contact/info"))
        .andExpect(status().is(anyOf(equalTo(200), equalTo(204))));
  }

  // ========== PUT /api/contact/info ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void upsertContactInfo_asAdmin_returns200() throws Exception {
    mockMvc
        .perform(
            put("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.phone", equalTo("+49 89 123456")))
        .andExpect(jsonPath("$.email", equalTo("praxis@example.de")))
        .andExpect(jsonPath("$.updatedAt").isNotEmpty());
  }

  @Test
  @WithMockUser(roles = "USER")
  void upsertContactInfo_asNonAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            put("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void upsertContactInfo_withInvalidEmail_returns400() throws Exception {
    UpsertContactInfoRequest request =
        new UpsertContactInfoRequest(
            "Tiergesund Praxis",
            "+49 89 123456",
            "kein-gültiges-email",
            "Musterstr. 1",
            "München",
            "80331",
            List.of());

    mockMvc
        .perform(
            put("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void upsertContactInfo_updatesExistingRecord() throws Exception {
    String firstResponse =
        mockMvc
            .perform(
                put("/api/contact/info")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(defaultRequest())))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    Long firstId = objectMapper.readTree(firstResponse).get("id").longValue();

    UpsertContactInfoRequest updated =
        new UpsertContactInfoRequest(
            "Neue Praxis", "+49 89 999999", "neu@example.de", "Neue Str. 2", "Berlin", "10115",
            List.of());

    mockMvc
        .perform(
            put("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(firstId.intValue())))
        .andExpect(jsonPath("$.email", equalTo("neu@example.de")))
        .andExpect(jsonPath("$.city", equalTo("Berlin")));
  }

  // ========== Helper ==========

  private UpsertContactInfoRequest defaultRequest() {
    return new UpsertContactInfoRequest(
        "Tiergesund Praxis",
        "+49 89 123456",
        "praxis@example.de",
        "Musterstr. 1",
        "München",
        "80331",
        List.of(new OfficeHourDto("Montag – Freitag", "09:00 – 18:00")));
  }
}
