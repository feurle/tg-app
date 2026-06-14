// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.questionnaire.QuestionnaireSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

/**
 * Notifies the practice by e-mail when a questionnaire is submitted. Lives in the contact module
 * because that module owns both the mail sender and the recipient address (ContactInfo). Listens to
 * the questionnaire module's public {@link QuestionnaireSubmittedEvent} so the questionnaire module
 * stays decoupled from mail concerns.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class QuestionnaireNotificationListener {

  @Value("${app.mail.from}")
  private String mailFrom;

  private final JavaMailSender mailSender;
  private final ContactInfoService contactInfoService;

  @ApplicationModuleListener
  public void onQuestionnaireSubmitted(QuestionnaireSubmittedEvent event) {
    String recipientEmail =
        contactInfoService
            .getContactInfo()
            .map(ContactInfo::getEmail)
            .filter(email -> email != null && !email.isBlank())
            .orElse(null);

    if (recipientEmail == null) {
      log.warn(
          "onQuestionnaireSubmitted: no contact e-mail configured, skipping notification for questionnaire {}",
          event.questionnaireId());
      return;
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(mailFrom);
    message.setTo(recipientEmail);
    message.setSubject("Neuer Erhebungsbogen eingegangen");
    message.setText(
        "Ein neuer Erhebungsbogen wurde ausgefüllt.\n\n"
            + "Tierhalter: "
            + nullToDash(event.ownerName())
            + "\n"
            + "Tier: "
            + nullToDash(event.petName())
            + "\n\n"
            + "Die vollständigen Angaben finden Sie in der Verwaltung.");

    try {
      mailSender.send(message);
      log.info(
          "onQuestionnaireSubmitted: notification sent for questionnaire {}",
          event.questionnaireId());
    } catch (MailException ex) {
      log.warn(
          "onQuestionnaireSubmitted: could not send notification for questionnaire {}: {}",
          event.questionnaireId(),
          ex.getMessage());
    }
  }

  private static String nullToDash(String value) {
    return value == null || value.isBlank() ? "—" : value;
  }
}
