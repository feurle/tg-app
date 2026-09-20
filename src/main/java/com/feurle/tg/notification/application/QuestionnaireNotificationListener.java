// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.notification.application;

import com.feurle.tg.notification.MailService;
import com.feurle.tg.questionnaire.QuestionnaireSubmittedEvent;
import com.feurle.tg.vetinfo.PrimaryContactEmailLookup;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

/**
 * Notifies the practice by e-mail when a questionnaire is submitted. Lives in the notification
 * module because that module owns the generic mail dispatch capability; the recipient address is
 * looked up through the vetinfo module's public {@link PrimaryContactEmailLookup}. Listens to the
 * questionnaire module's public {@link QuestionnaireSubmittedEvent} so the questionnaire module
 * stays decoupled from mail concerns.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class QuestionnaireNotificationListener {

  private final MailService mailService;
  private final PrimaryContactEmailLookup primaryContactEmailLookup;

  @ApplicationModuleListener
  public void onQuestionnaireSubmitted(QuestionnaireSubmittedEvent event) {
    String recipientEmail = primaryContactEmailLookup.primaryEmail().orElse(null);

    if (recipientEmail == null) {
      log.warn(
          "onQuestionnaireSubmitted: no contact e-mail configured, skipping notification for questionnaire {}",
          event.questionnaireId());
      return;
    }

    String body =
        "Ein neuer Erhebungsbogen wurde ausgefüllt.\n\n"
            + "Tierhalter: "
            + nullToDash(event.ownerName())
            + "\n"
            + "Tier: "
            + nullToDash(event.petName())
            + "\n\n"
            + "Die vollständigen Angaben finden Sie in der Verwaltung.";

    try {
      mailService.send(recipientEmail, "Neuer Erhebungsbogen eingegangen", body);
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
