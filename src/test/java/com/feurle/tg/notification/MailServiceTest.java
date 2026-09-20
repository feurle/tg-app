// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.verify;

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
class MailServiceTest {

  private static final String MAIL_FROM = "Tier Gesund App <agent@tier-gesund.at>";

  @Mock private JavaMailSender mailSender;

  @InjectMocks private MailService mailService;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(mailService, "mailFrom", MAIL_FROM);
  }

  @Test
  void send_setsAllFieldsIncludingReplyTo() {
    mailService.send("empfaenger@example.com", "Betreff", "Text", "absender@example.com");

    SimpleMailMessage sent = capturedMail();
    assertThat(sent.getFrom()).isEqualTo(MAIL_FROM);
    assertThat(sent.getTo()).containsExactly("empfaenger@example.com");
    assertThat(sent.getReplyTo()).isEqualTo("absender@example.com");
    assertThat(sent.getSubject()).isEqualTo("Betreff");
    assertThat(sent.getText()).isEqualTo("Text");
  }

  @Test
  void send_withoutReplyTo_leavesReplyToUnset() {
    mailService.send("empfaenger@example.com", "Betreff", "Text");

    SimpleMailMessage sent = capturedMail();
    assertThat(sent.getReplyTo()).isNull();
  }

  private SimpleMailMessage capturedMail() {
    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());
    return captor.getValue();
  }
}
