// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
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
class ContactServiceTest {

  private static final String MAIL_FROM = "Tier Gesund App <agent@tier-gesund.at>";

  @Mock private JavaMailSender mailSender;

  @Mock private ContactInfoRepository contactInfoRepository;

  @InjectMocks private ContactService contactService;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(contactService, "mailFrom", MAIL_FROM);
  }

  @Test
  void sendMessage_sendsMailWithCorrectFields() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setEmail("empfaenger@example.com");
    when(contactInfoRepository.findFirst()).thenReturn(Optional.of(contactInfo));

    contactService.sendMessage(
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
  void sendMessage_throwsWhenNoContactInfoConfigured() {
    when(contactInfoRepository.findFirst()).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                contactService.sendMessage(
                    "Betreff", "Nachrichtentext", "absender@example.com", "Max Mustermann"))
        .isInstanceOf(IllegalStateException.class);
  }
}
