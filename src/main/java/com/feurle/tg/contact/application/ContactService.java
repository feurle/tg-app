// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.contact.infrastructure.config.ContactConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

  private final JavaMailSender mailSender;
  private final ContactConfig contactConfig;

  public void sendMessage(String title, String text, String replyToEmail) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(contactConfig.getRecipientEmail());
    message.setReplyTo(replyToEmail);
    message.setSubject(title);
    message.setText(text);
    mailSender.send(message);
  }
}
