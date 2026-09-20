// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/** Generic e-mail dispatch, shared by any module that needs to notify the practice or a user. */
@Service
@RequiredArgsConstructor
public class MailService {

  @Value("${app.mail.from}")
  private String mailFrom;

  private final JavaMailSender mailSender;

  public void send(String to, String subject, String body) {
    send(to, subject, body, null);
  }

  public void send(String to, String subject, String body, String replyTo) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(mailFrom);
    message.setTo(to);
    if (replyTo != null && !replyTo.isBlank()) {
      message.setReplyTo(replyTo);
    }
    message.setSubject(subject);
    message.setText(body);
    mailSender.send(message);
  }
}
