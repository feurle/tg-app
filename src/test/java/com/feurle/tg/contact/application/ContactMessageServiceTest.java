// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
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
import org.springframework.mail.MailSendException;

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

  private static Referral referral(ReferralUrgency urgency) {
    return new Referral(
        "Tierarztpraxis Muster",
        "Dr. Erika Muster",
        "muster@example.com",
        "+43 660 1111111",
        "Hans Halter",
        "hans@example.com",
        "Rex",
        "Hund",
        "Labrador",
        "9 Jahre",
        "Chronische Lahmheit hinten links, Chiropraktik?",
        "Schmerzmittel seit 3 Wochen",
        urgency);
  }

  @Test
  void requestReferral_mailsPracticeWithReplyToAndConfirmsToReferringVet() {
    contactMessageService.requestReferral(referral(ReferralUrgency.URGENT));

    org.mockito.ArgumentCaptor<String> body = org.mockito.ArgumentCaptor.forClass(String.class);
    verify(mailService)
        .send(
            eq("empfaenger@example.com"),
            eq("Überweisung (dringend): Hund – Tierarztpraxis Muster"),
            body.capture(),
            eq("muster@example.com"));
    assertThat(body.getValue())
        .contains("Hans Halter", "hans@example.com", "Rex", "Labrador", "Chronische Lahmheit")
        .contains("Schmerzmittel seit 3 Wochen");

    org.mockito.ArgumentCaptor<String> confirmation =
        org.mockito.ArgumentCaptor.forClass(String.class);
    verify(mailService)
        .send(
            eq("muster@example.com"),
            eq("Ihre Überweisung ist eingegangen"),
            confirmation.capture());
    assertThat(confirmation.getValue()).contains("Dr. Erika Muster", "empfaenger@example.com");
  }

  @Test
  void requestReferral_omitsUrgencyFromSubjectForRoutineAndSkipsEmptyOptionalFields() {
    Referral minimal =
        new Referral(
            "Praxis",
            "Dr. X",
            "x@example.com",
            null,
            "Halter",
            "0660",
            " ",
            "Katze",
            null,
            null,
            "Frage",
            null,
            ReferralUrgency.ROUTINE);

    contactMessageService.requestReferral(minimal);

    org.mockito.ArgumentCaptor<String> body = org.mockito.ArgumentCaptor.forClass(String.class);
    verify(mailService)
        .send(
            eq("empfaenger@example.com"),
            eq("Überweisung: Katze – Praxis"),
            body.capture(),
            eq("x@example.com"));
    assertThat(body.getValue()).doesNotContain("Rasse:", "Alter:", "VORBEHANDLUNG", "Telefon:");
  }

  @Test
  void requestReferral_stillSucceedsWhenConfirmationMailFails() {
    lenient()
        .doThrow(new MailSendException("down"))
        .when(mailService)
        .send(eq("muster@example.com"), anyString(), anyString());

    contactMessageService.requestReferral(referral(ReferralUrgency.SOON));

    verify(mailService)
        .send(
            eq("empfaenger@example.com"),
            eq("Überweisung (zeitnah): Hund – Tierarztpraxis Muster"),
            anyString(),
            eq("muster@example.com"));
  }

  @Test
  void requestReferral_throwsWhenNoContactInfoConfigured() {
    when(primaryContactEmailLookup.primaryEmail()).thenReturn(Optional.empty());

    assertThatThrownBy(
            () -> contactMessageService.requestReferral(referral(ReferralUrgency.ROUTINE)))
        .isInstanceOf(IllegalStateException.class);
  }
}
