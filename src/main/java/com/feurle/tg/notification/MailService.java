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

  /**
   * Optional (env {@code MAIL_TO}). When set, every mail goes to this address instead of its real
   * recipient, so staging and local runs never write to the practice or to outside vets.
   */
  @Value("${app.mail.to:}")
  private String mailTo;

  private final JavaMailSender mailSender;

  public void send(String to, String subject, String body) {
    send(to, subject, body, null);
  }

  public void send(String to, String subject, String body, String replyTo) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(mailFrom);
    if (mailTo != null && !mailTo.isBlank()) {
      message.setTo(mailTo.strip());
      subject = "[an: " + to + "] " + subject;
    } else {
      message.setTo(to);
    }
    if (replyTo != null && !replyTo.isBlank()) {
      message.setReplyTo(replyTo);
    }
    message.setSubject(subject);
    message.setText(body);
    mailSender.send(message);
  }
}
