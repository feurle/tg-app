// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.vetinfo.application.VetInfoService;
import com.feurle.tg.vetinfo.domain.OfficeHour;
import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.domain.VetInfoRepository;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.OfficeHourDto;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.UpsertVetInfoRequest;
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
class VetInfoControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private VetInfoRepository vetInfoRepository;

  @Autowired private VetInfoService vetInfoService;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    vetInfoRepository.deleteAll();
  }

  @AfterEach
  void tearDown() {
    vetInfoRepository.deleteAll();
  }

  // ========== GET /api/vetinfo ==========

  @Test
  void getAllVetInfo_returnsEmptyList_whenNoData() throws Exception {
    mockMvc
        .perform(get("/api/vetinfo"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void getAllVetInfo_returnsAllRecords() throws Exception {
    vetInfoService.createVetInfo(
        "Praxis A", "+49 89 1", "a@example.de", "Str. 1", "München", "80331", false, List.of());
    vetInfoService.createVetInfo(
        "Praxis B", "+49 89 2", "b@example.de", "Str. 2", "Berlin", "10115", false, List.of());

    mockMvc
        .perform(get("/api/vetinfo"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)));
  }

  @Test
  void getAllVetInfo_isPublic_withoutAuth() throws Exception {
    mockMvc.perform(get("/api/vetinfo")).andExpect(status().isOk());
  }

  // ========== GET /api/vetinfo/{id} ==========

  @Test
  void getVetInfoById_returnsRecord() throws Exception {
    VetInfo saved =
        vetInfoService.createVetInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            true,
            List.of(new OfficeHour("Montag – Freitag", "09:00 – 18:00")));

    mockMvc
        .perform(get("/api/vetinfo/" + saved.getId()))
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
  void getVetInfoById_returns404_whenNotFound() throws Exception {
    mockMvc.perform(get("/api/vetinfo/999")).andExpect(status().isNotFound());
  }

  // ========== POST /api/vetinfo ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createVetInfo_asAdmin_returns201() throws Exception {
    mockMvc
        .perform(
            post("/api/vetinfo")
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
  void createVetInfo_primaryFlag_clearsPreviousPrimary() throws Exception {
    VetInfo existing =
        vetInfoService.createVetInfo(
            "Praxis A", null, "a@example.de", null, null, null, true, List.of());

    mockMvc
        .perform(
            post("/api/vetinfo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.primary", equalTo(true)));

    assertThat(vetInfoService.getVetInfoById(existing.getId()).isPrimary()).isFalse();
  }

  @Test
  @WithMockUser(roles = "USER")
  void createVetInfo_asNonAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            post("/api/vetinfo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createVetInfo_withInvalidEmail_returns400() throws Exception {
    UpsertVetInfoRequest request =
        new UpsertVetInfoRequest(
            "Tiergesund Praxis",
            "+49 89 123456",
            "kein-gültiges-email",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of());

    mockMvc
        .perform(
            post("/api/vetinfo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  // ========== PUT /api/vetinfo/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateVetInfo_asAdmin_returns200() throws Exception {
    VetInfo saved =
        vetInfoService.createVetInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of());

    UpsertVetInfoRequest updated =
        new UpsertVetInfoRequest(
            "Neue Praxis",
            "+49 89 999999",
            "neu@example.de",
            "Neue Str. 2",
            "Berlin",
            "10115",
            false,
            List.of());

    mockMvc
        .perform(
            put("/api/vetinfo/" + saved.getId())
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
  void updateVetInfo_returns404_whenNotFound() throws Exception {
    mockMvc
        .perform(
            put("/api/vetinfo/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockUser(roles = "USER")
  void updateVetInfo_asNonAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            put("/api/vetinfo/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(defaultRequest())))
        .andExpect(status().isForbidden());
  }

  // ========== DELETE /api/vetinfo/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteVetInfo_asAdmin_returns204() throws Exception {
    VetInfo saved =
        vetInfoService.createVetInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of());

    mockMvc.perform(delete("/api/vetinfo/" + saved.getId())).andExpect(status().isNoContent());

    assertThat(vetInfoRepository.findAll()).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteVetInfo_returns404_whenNotFound() throws Exception {
    mockMvc.perform(delete("/api/vetinfo/999")).andExpect(status().isNotFound());
  }

  @Test
  @WithMockUser(roles = "USER")
  void deleteVetInfo_asNonAdmin_returns403() throws Exception {
    mockMvc.perform(delete("/api/vetinfo/1")).andExpect(status().isForbidden());
  }

  // ========== Helper ==========

  private UpsertVetInfoRequest defaultRequest() {
    return new UpsertVetInfoRequest(
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
