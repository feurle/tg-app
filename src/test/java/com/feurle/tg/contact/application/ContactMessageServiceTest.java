// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.feurle.tg.contact.domain.ContactInfo;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ContactMessageServiceTest {

  private static final String MAIL_FROM = "Tier Gesund App <agent@tier-gesund.at>";

  @Mock private JavaMailSender mailSender;

  @Mock private ContactInfoService contactInfoService;

  @InjectMocks private ContactMessageService contactMessageService;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(contactMessageService, "mailFrom", MAIL_FROM);
  }

  @Test
  void sendMessage_sendsMailWithCorrectFields() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setEmail("empfaenger@example.com");
    when(contactInfoService.getContactInfo()).thenReturn(Optional.of(contactInfo));

    contactMessageService.sendMessage(
        "Betreff", "Nachrichtentext", "absender@example.com", "Max Mustermann");

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    SimpleMailMessage sent = captor.getValue();
    assertThat(sent.getTo()).containsExactly("empfaenger@example.com");
    assertThat(sent.getReplyTo()).isEqualTo("absender@example.com");
    assertThat(sent.getSubject()).isEqualTo("Betreff");
    assertThat(sent.getText()).isEqualTo("Nachrichtentext\n\nMax Mustermann");
    assertThat(sent.getFrom()).isEqualTo(MAIL_FROM);
  }

  @Test
  void requestAppointment_composesSubjectFromDateAndTime() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setEmail("empfaenger@example.com");
    when(contactInfoService.getContactInfo()).thenReturn(Optional.of(contactInfo));

    contactMessageService.requestAppointment(
        "Max Mustermann",
        "absender@example.com",
        "+43 660 1234567",
        LocalDate.of(2026, 8, 12),
        LocalTime.of(14, 30),
        "Mein Hund hinkt seit gestern.");

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertThat(captor.getValue().getSubject()).isEqualTo("Terminwunsch: 12.08.2026 um 14:30");
  }

  @Test
  void requestAppointment_omitsTimeFromSubjectWhenNotGiven() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setEmail("empfaenger@example.com");
    when(contactInfoService.getContactInfo()).thenReturn(Optional.of(contactInfo));

    contactMessageService.requestAppointment(
        "Max Mustermann",
        "absender@example.com",
        "+43 660 1234567",
        LocalDate.of(2026, 8, 12),
        null,
        "Mein Hund hinkt seit gestern.");

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertThat(captor.getValue().getSubject()).isEqualTo("Terminwunsch: 12.08.2026");
  }

  @Test
  void requestAppointment_bodyContainsAppointmentDetailsAndMessage() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setEmail("empfaenger@example.com");
    when(contactInfoService.getContactInfo()).thenReturn(Optional.of(contactInfo));

    contactMessageService.requestAppointment(
        "Max Mustermann",
        "absender@example.com",
        "+43 660 1234567",
        LocalDate.of(2026, 8, 12),
        LocalTime.of(14, 30),
        "Mein Hund hinkt seit gestern.");

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertThat(captor.getValue().getText())
        .isEqualTo(
            """
            Terminanfrage über die Website.

            Wunschtermin: 12.08.2026 um 14:30
            Name: Max Mustermann
            E-Mail: absender@example.com
            Telefon: +43 660 1234567

            Nachricht:
            Mein Hund hinkt seit gestern.""");
  }

  @Test
  void requestAppointment_omitsPhoneAndMessageLinesWhenBlank() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setEmail("empfaenger@example.com");
    when(contactInfoService.getContactInfo()).thenReturn(Optional.of(contactInfo));

    contactMessageService.requestAppointment(
        "Max Mustermann", "absender@example.com", "  ", LocalDate.of(2026, 8, 12), null, null);

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertThat(captor.getValue().getText())
        .isEqualTo(
            """
            Terminanfrage über die Website.

            Wunschtermin: 12.08.2026
            Name: Max Mustermann
            E-Mail: absender@example.com""");
  }

  @Test
  void requestAppointment_sendsToConfiguredContactWithSenderAsReplyTo() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setEmail("empfaenger@example.com");
    when(contactInfoService.getContactInfo()).thenReturn(Optional.of(contactInfo));

    contactMessageService.requestAppointment(
        "Max Mustermann", "absender@example.com", null, LocalDate.of(2026, 8, 12), null, null);

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    SimpleMailMessage sent = captor.getValue();
    assertThat(sent.getTo()).containsExactly("empfaenger@example.com");
    assertThat(sent.getReplyTo()).isEqualTo("absender@example.com");
    assertThat(sent.getFrom()).isEqualTo(MAIL_FROM);
  }

  @Test
  void requestAppointment_throwsWhenNoContactInfoConfigured() {
    when(contactInfoService.getContactInfo()).thenReturn(Optional.empty());

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
    when(contactInfoService.getContactInfo()).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                contactMessageService.sendMessage(
                    "Betreff", "Nachrichtentext", "absender@example.com", "Max Mustermann"))
        .isInstanceOf(IllegalStateException.class);
  }
}
