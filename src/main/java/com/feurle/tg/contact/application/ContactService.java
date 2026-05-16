// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

  @Value("${app.mail.from}")
  private String mailFrom;

  private final JavaMailSender mailSender;
  private final ContactInfoRepository contactInfoRepository;

  public void sendMessage(String title, String text, String replyToEmail, String senderName) {
    String recipientEmail =
        contactInfoRepository
            .findFirst()
            .map(ContactInfo::getEmail)
            .filter(email -> !email.isBlank())
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "Keine Kontakt-E-Mail konfiguriert. Bitte ContactInfo über die Admin-Oberfläche pflegen."));

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(mailFrom);
    message.setTo(recipientEmail);
    message.setReplyTo(replyToEmail);
    message.setSubject(title);
    message.setText(text + "\n\n" + senderName);
    mailSender.send(message);
    log.info("sendMessage: SEND SUCCESS");
  }
}
