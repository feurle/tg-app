// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.feurle.tg.notification.MailService;
import com.feurle.tg.vetinfo.PrimaryContactEmailLookup;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ContactMessageServiceTest {

  @Mock private MailService mailService;

  @Mock private PrimaryContactEmailLookup primaryContactEmailLookup;

  @InjectMocks private ContactMessageService contactMessageService;

  @BeforeEach
  void setUp() {
    when(primaryContactEmailLookup.primaryEmail())
        .thenReturn(Optional.of("empfaenger@example.com"));
  }

  @Test
  void sendMessage_sendsMailWithCorrectFields() {
    contactMessageService.sendMessage(
        "Betreff", "Nachrichtentext", "absender@example.com", "Max Mustermann");

    verify(mailService)
        .send(
            "empfaenger@example.com",
            "Betreff",
            "Nachrichtentext\n\nMax Mustermann",
            "absender@example.com");
  }

  @Test
  void requestAppointment_composesSubjectFromDateAndTime() {
    contactMessageService.requestAppointment(
        "Max Mustermann",
        "absender@example.com",
        "+43 660 1234567",
        LocalDate.of(2026, 8, 12),
        LocalTime.of(14, 30),
        "Mein Hund hinkt seit gestern.");

    verify(mailService)
        .send(
            org.mockito.ArgumentMatchers.eq("empfaenger@example.com"),
            org.mockito.ArgumentMatchers.eq("Terminwunsch: 12.08.2026 um 14:30"),
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.eq("absender@example.com"));
  }

  @Test
  void requestAppointment_omitsTimeFromSubjectWhenNotGiven() {
    contactMessageService.requestAppointment(
        "Max Mustermann",
        "absender@example.com",
        "+43 660 1234567",
        LocalDate.of(2026, 8, 12),
        null,
        "Mein Hund hinkt seit gestern.");

    verify(mailService)
        .send(
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.eq("Terminwunsch: 12.08.2026"),
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.anyString());
  }

  @Test
  void requestAppointment_bodyContainsAppointmentDetailsAndMessage() {
    contactMessageService.requestAppointment(
        "Max Mustermann",
        "absender@example.com",
        "+43 660 1234567",
        LocalDate.of(2026, 8, 12),
        LocalTime.of(14, 30),
        "Mein Hund hinkt seit gestern.");

    verify(mailService)
        .send(
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.eq(
                """
                Terminanfrage über die Website.

                Wunschtermin: 12.08.2026 um 14:30
                Name: Max Mustermann
                E-Mail: absender@example.com
                Telefon: +43 660 1234567

                Nachricht:
                Mein Hund hinkt seit gestern."""),
            org.mockito.ArgumentMatchers.anyString());
  }

  @Test
  void requestAppointment_omitsPhoneAndMessageLinesWhenBlank() {
    contactMessageService.requestAppointment(
        "Max Mustermann", "absender@example.com", "  ", LocalDate.of(2026, 8, 12), null, null);

    verify(mailService)
        .send(
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.eq(
                """
                Terminanfrage über die Website.

                Wunschtermin: 12.08.2026
                Name: Max Mustermann
                E-Mail: absender@example.com"""),
            org.mockito.ArgumentMatchers.anyString());
  }

  @Test
  void requestAppointment_sendsToConfiguredContactWithSenderAsReplyTo() {
    contactMessageService.requestAppointment(
        "Max Mustermann", "absender@example.com", null, LocalDate.of(2026, 8, 12), null, null);

    verify(mailService)
        .send(
            org.mockito.ArgumentMatchers.eq("empfaenger@example.com"),
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.anyString(),
            org.mockito.ArgumentMatchers.eq("absender@example.com"));
  }

  @Test
  void requestAppointment_throwsWhenNoContactInfoConfigured() {
    when(primaryContactEmailLookup.primaryEmail()).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                contactMessageService.requestAppointment(
                    "Max Mustermann",
                    "absender@example.com",
                    null,
                    LocalDate.of(2026, 8, 12),
                    null,
                    null))
        .isInstanceOf(IllegalStateException.class);
  }

  @Test
  void sendMessage_throwsWhenNoContactInfoConfigured() {
    when(primaryContactEmailLookup.primaryEmail()).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                contactMessageService.sendMessage(
                    "Betreff", "Nachrichtentext", "absender@example.com", "Max Mustermann"))
        .isInstanceOf(IllegalStateException.class);
  }
}
