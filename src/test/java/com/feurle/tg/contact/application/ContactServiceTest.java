// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.feurle.tg.contact.infrastructure.config.ContactConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

  @Mock private JavaMailSender mailSender;

  @Mock private ContactConfig contactConfig;

  @InjectMocks private ContactService contactService;

  @Test
  void sendMessage_sendsMailWithCorrectFields() {
    when(contactConfig.getRecipientEmail()).thenReturn("empfaenger@example.com");

    contactService.sendMessage("Betreff", "Nachrichtentext", "absender@example.com");

    ArgumentCaptor<SimpleMailMessage> captor = forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    SimpleMailMessage sent = captor.getValue();
    assertThat(sent.getTo()).containsExactly("empfaenger@example.com");
    assertThat(sent.getReplyTo()).isEqualTo("absender@example.com");
    assertThat(sent.getSubject()).isEqualTo("Betreff");
    assertThat(sent.getText()).isEqualTo("Nachrichtentext");
  }
}
