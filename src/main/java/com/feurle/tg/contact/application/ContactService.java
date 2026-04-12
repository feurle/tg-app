// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

  private final JavaMailSender mailSender;
  private final ContactInfoRepository contactInfoRepository;

  public void sendMessage(String title, String text, String replyToEmail) {
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
    message.setTo(recipientEmail);
    message.setReplyTo(replyToEmail);
    message.setSubject(title);
    message.setText(text);
    mailSender.send(message);
  }
}
