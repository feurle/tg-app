// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.contact.application.ReferralUrgency;
import com.feurle.tg.contact.infrastructure.rest.dto.RequestAppointmentRequest;
import com.feurle.tg.contact.infrastructure.rest.dto.RequestReferralRequest;
import com.feurle.tg.contact.infrastructure.rest.dto.SendMessageRequest;
import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.domain.VetInfoRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

/**
 * Covers the two public contact actions behind the CTA buttons: sending a message and requesting an
 * appointment. Both endpoints must stay reachable without authentication.
 */
@SpringBootTest
@TestPropertySource(
    properties = {
      "spring.jpa.hibernate.ddl-auto=create-drop",
      // the mocked JavaMailSender is not a JavaMailSenderImpl, which the health contributor
      // requires
      "management.health.mail.enabled=false"
    })
class ContactControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private VetInfoRepository vetInfoRepository;

  @MockitoBean private JavaMailSender mailSender;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
    vetInfoRepository.deleteAll();
  }

  @AfterEach
  void tearDown() {
    vetInfoRepository.deleteAll();
  }

  private void givenConfiguredContactEmail() {
    VetInfo vetInfo = new VetInfo();
    vetInfo.setName("Praxis");
    vetInfo.setEmail("praxis@example.com");
    vetInfo.setPrimary(true);
    vetInfoRepository.save(vetInfo);
  }

  private SimpleMailMessage capturedMail() {
    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());
    return captor.getValue();
  }

  // ========== POST /api/contact/message ==========

  @Test
  void sendMessage_returnsNoContentAndSendsMail_whenUnauthenticatedRequestIsValid()
      throws Exception {
    givenConfiguredContactEmail();
    SendMessageRequest request =
        new SendMessageRequest(
            "Frage zur Impfung",
            "Wann ist die nächste Auffrischung?",
            "kunde@example.com",
            "Max Mustermann");

    mockMvc
        .perform(
            post("/api/contact/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNoContent());

    SimpleMailMessage sent = capturedMail();
    assertThat(sent.getTo()).containsExactly("praxis@example.com");
    assertThat(sent.getSubject()).isEqualTo("Frage zur Impfung");
    assertThat(sent.getReplyTo()).isEqualTo("kunde@example.com");
  }

  @Test
  void sendMessage_returnsBadRequest_whenEmailIsMalformed() throws Exception {
    givenConfiguredContactEmail();
    SendMessageRequest request =
        new SendMessageRequest("Betreff", "Text", "keine-email", "Max Mustermann");

    mockMvc
        .perform(
            post("/api/contact/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(mailSender);
  }

  // ========== POST /api/contact/appointment ==========

  @Test
  void requestAppointment_returnsNoContentAndSendsMail_whenUnauthenticatedRequestIsValid()
      throws Exception {
    givenConfiguredContactEmail();
    RequestAppointmentRequest request =
        new RequestAppointmentRequest(
            "Max Mustermann",
            "kunde@example.com",
            "+43 660 1234567",
            LocalDate.now().plusDays(7),
            LocalTime.of(14, 30),
            "Mein Hund hinkt seit gestern.");

    mockMvc
        .perform(
            post("/api/contact/appointment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNoContent());

    SimpleMailMessage sent = capturedMail();
    assertThat(sent.getTo()).containsExactly("praxis@example.com");
    assertThat(sent.getSubject()).startsWith("Terminwunsch: ");
    assertThat(sent.getReplyTo()).isEqualTo("kunde@example.com");
    assertThat(sent.getText()).contains("+43 660 1234567", "Mein Hund hinkt seit gestern.");
  }

  @Test
  void requestAppointment_returnsNoContent_whenOptionalFieldsAreOmitted() throws Exception {
    givenConfiguredContactEmail();
    RequestAppointmentRequest request =
        new RequestAppointmentRequest(
            "Max Mustermann", "kunde@example.com", null, LocalDate.now().plusDays(7), null, null);

    mockMvc
        .perform(
            post("/api/contact/appointment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNoContent());

    SimpleMailMessage sent = capturedMail();
    assertThat(sent.getText()).doesNotContain("Telefon:", "Nachricht:");
  }

  @Test
  void requestAppointment_returnsBadRequest_whenPreferredDateIsMissing() throws Exception {
    givenConfiguredContactEmail();
    RequestAppointmentRequest request =
        new RequestAppointmentRequest(
            "Max Mustermann", "kunde@example.com", null, null, null, null);

    mockMvc
        .perform(
            post("/api/contact/appointment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(mailSender);
  }

  @Test
  void requestAppointment_returnsBadRequest_whenPreferredDateIsInThePast() throws Exception {
    givenConfiguredContactEmail();
    RequestAppointmentRequest request =
        new RequestAppointmentRequest(
            "Max Mustermann", "kunde@example.com", null, LocalDate.now().minusDays(1), null, null);

    mockMvc
        .perform(
            post("/api/contact/appointment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(mailSender);
  }

  @Test
  void requestAppointment_returnsBadRequest_whenEmailIsMalformed() throws Exception {
    givenConfiguredContactEmail();
    RequestAppointmentRequest request =
        new RequestAppointmentRequest(
            "Max Mustermann", "keine-email", null, LocalDate.now().plusDays(7), null, null);

    mockMvc
        .perform(
            post("/api/contact/appointment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(mailSender);
  }

  // ========== POST /api/contact/referral ==========

  private static RequestReferralRequest referralRequest(boolean ownerConsent, String email) {
    return new RequestReferralRequest(
        "Tierarztpraxis Muster",
        "Dr. Erika Muster",
        email,
        null,
        "Hans Halter",
        "hans@example.com",
        "Rex",
        "Hund",
        "Labrador",
        "9 Jahre",
        "Chronische Lahmheit hinten links",
        null,
        ReferralUrgency.SOON,
        ownerConsent);
  }

  @Test
  void requestReferral_sendsPracticeMailAndConfirmation_whenUnauthenticatedRequestIsValid()
      throws Exception {
    givenConfiguredContactEmail();

    mockMvc
        .perform(
            post("/api/contact/referral")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(referralRequest(true, "muster@example.com"))))
        .andExpect(status().isNoContent());

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender, times(2)).send(captor.capture());
    SimpleMailMessage practiceMail = captor.getAllValues().get(0);
    assertThat(practiceMail.getTo()).containsExactly("praxis@example.com");
    assertThat(practiceMail.getSubject())
        .isEqualTo("Überweisung (zeitnah): Hund – Tierarztpraxis Muster");
    assertThat(practiceMail.getReplyTo()).isEqualTo("muster@example.com");
    SimpleMailMessage confirmation = captor.getAllValues().get(1);
    assertThat(confirmation.getTo()).containsExactly("muster@example.com");
  }

  @Test
  void requestReferral_returnsBadRequest_whenOwnerConsentIsMissing() throws Exception {
    givenConfiguredContactEmail();

    mockMvc
        .perform(
            post("/api/contact/referral")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(referralRequest(false, "muster@example.com"))))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(mailSender);
  }

  @Test
  void requestReferral_returnsBadRequest_whenEmailIsMalformed() throws Exception {
    givenConfiguredContactEmail();

    mockMvc
        .perform(
            post("/api/contact/referral")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(referralRequest(true, "keine-email"))))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(mailSender);
  }
}
