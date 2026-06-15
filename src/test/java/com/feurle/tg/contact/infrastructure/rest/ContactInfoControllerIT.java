// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.contact.application.ContactInfoService;
import com.feurle.tg.contact.domain.ContactInfo;
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
  void getAllContactInfo_returnsEmptyList_whenNoData() throws Exception {
    mockMvc
        .perform(get("/api/contact/info"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void getAllContactInfo_returnsAllRecords() throws Exception {
    contactInfoService.createContactInfo(
        "Praxis A", "+49 89 1", "a@example.de", "Str. 1", "München", "80331", false, List.of());
    contactInfoService.createContactInfo(
        "Praxis B", "+49 89 2", "b@example.de", "Str. 2", "Berlin", "10115", false, List.of());

    mockMvc
        .perform(get("/api/contact/info"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)));
  }

  @Test
  void getAllContactInfo_isPublic_withoutAuth() throws Exception {
    mockMvc.perform(get("/api/contact/info")).andExpect(status().isOk());
  }

  // ========== GET /api/contact/info/{id} ==========

  @Test
  void getContactInfoById_returnsRecord() throws Exception {
    ContactInfo saved =
        contactInfoService.createContactInfo(
            "Tiergesund Praxis", "+49 89 123456", "praxis@example.de", "Musterstr. 1", "München",
            "80331", true,
            List.of(new OfficeHour("Montag – Freitag", "09:00 – 18:00")));

    mockMvc
        .perform(get("/api/contact/info/" + saved.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(saved.getId().intValue())))
        .andExpect(jsonPath("$.name", equalTo("Tiergesund Praxis")))
        .andExpect(jsonPath("$.phone", equalTo("+49 89 123456")))
        .andExpect(jsonPath("$.email", equalTo("praxis@example.de")))
        .andExpect(jsonPath("$.primary", equalTo(true)))
        .andExpect(jsonPath("$.officeHours", hasSize(1)))
        .andExpect(jsonPath("$.officeHours[0].label", equalTo("Montag – Freitag")));
  }

  @Test
  void getContactInfoById_returns404_whenNotFound() throws Exception {
    mockMvc.perform(get("/api/contact/info/999")).andExpect(status().isNotFound());
  }

  // ========== POST /api/contact/info ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createContactInfo_asAdmin_returns201() throws Exception {
    mockMvc
        .perform(
            post("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name", equalTo("Tiergesund Praxis")))
        .andExpect(jsonPath("$.phone", equalTo("+49 89 123456")))
        .andExpect(jsonPath("$.email", equalTo("praxis@example.de")))
        .andExpect(jsonPath("$.primary", equalTo(true)))
        .andExpect(jsonPath("$.updatedAt").isNotEmpty());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createContactInfo_primaryFlag_clearsPreviousPrimary() throws Exception {
    ContactInfo existing =
        contactInfoService.createContactInfo(
            "Praxis A", null, "a@example.de", null, null, null, true, List.of());

    mockMvc
        .perform(
            post("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.primary", equalTo(true)));

    assertThat(contactInfoService.getContactInfoById(existing.getId()).isPrimary()).isFalse();
  }

  @Test
  @WithMockUser(roles = "USER")
  void createContactInfo_asNonAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            post("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createContactInfo_withInvalidEmail_returns400() throws Exception {
    UpsertContactInfoRequest request =
        new UpsertContactInfoRequest(
            "Tiergesund Praxis", "+49 89 123456", "kein-gültiges-email", "Musterstr. 1", "München",
            "80331", false, List.of());

    mockMvc
        .perform(
            post("/api/contact/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  // ========== PUT /api/contact/info/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateContactInfo_asAdmin_returns200() throws Exception {
    ContactInfo saved =
        contactInfoService.createContactInfo(
            "Tiergesund Praxis", "+49 89 123456", "praxis@example.de", "Musterstr. 1", "München",
            "80331", false, List.of());

    UpsertContactInfoRequest updated =
        new UpsertContactInfoRequest(
            "Neue Praxis", "+49 89 999999", "neu@example.de", "Neue Str. 2", "Berlin", "10115",
            false, List.of());

    mockMvc
        .perform(
            put("/api/contact/info/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(saved.getId().intValue())))
        .andExpect(jsonPath("$.name", equalTo("Neue Praxis")))
        .andExpect(jsonPath("$.email", equalTo("neu@example.de")))
        .andExpect(jsonPath("$.city", equalTo("Berlin")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateContactInfo_returns404_whenNotFound() throws Exception {
    mockMvc
        .perform(
            put("/api/contact/info/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockUser(roles = "USER")
  void updateContactInfo_asNonAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            put("/api/contact/info/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isForbidden());
  }

  // ========== DELETE /api/contact/info/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteContactInfo_asAdmin_returns204() throws Exception {
    ContactInfo saved =
        contactInfoService.createContactInfo(
            "Tiergesund Praxis", "+49 89 123456", "praxis@example.de", "Musterstr. 1", "München",
            "80331", false, List.of());

    mockMvc
        .perform(delete("/api/contact/info/" + saved.getId()))
        .andExpect(status().isNoContent());

    assertThat(contactInfoRepository.findAll()).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteContactInfo_returns404_whenNotFound() throws Exception {
    mockMvc.perform(delete("/api/contact/info/999")).andExpect(status().isNotFound());
  }

  @Test
  @WithMockUser(roles = "USER")
  void deleteContactInfo_asNonAdmin_returns403() throws Exception {
    mockMvc.perform(delete("/api/contact/info/1")).andExpect(status().isForbidden());
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
        true,
        List.of(new OfficeHourDto("Montag – Freitag", "09:00 – 18:00")));
  }
}
