// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.feurle.tg.notification.application.QuestionnaireNotificationListener;
import com.feurle.tg.questionnaire.QuestionnaireSubmittedEvent;
import com.feurle.tg.vetinfo.PrimaryContactEmailLookup;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuestionnaireNotificationListenerTest {

  @Mock private MailService mailService;

  @Mock private PrimaryContactEmailLookup primaryContactEmailLookup;

  @InjectMocks private QuestionnaireNotificationListener listener;

  @Test
  void mailNamesTheSpeciesInGerman() {
    when(primaryContactEmailLookup.primaryEmail()).thenReturn(Optional.of("praxis@example.com"));

    listener.onQuestionnaireSubmitted(
        new QuestionnaireSubmittedEvent(1L, "Max Mustermann", "Minka", "CAT"));

    ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
    verify(mailService).send(eq("praxis@example.com"), anyString(), body.capture());
    assertThat(body.getValue()).contains("Tier: Minka").contains("Tierart: Katze");
  }

  @Test
  void mailShowsDashForSubmissionsWithoutSpecies() {
    when(primaryContactEmailLookup.primaryEmail()).thenReturn(Optional.of("praxis@example.com"));

    listener.onQuestionnaireSubmitted(
        new QuestionnaireSubmittedEvent(1L, "Max Mustermann", "Rex", null));

    ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
    verify(mailService).send(eq("praxis@example.com"), anyString(), body.capture());
    assertThat(body.getValue()).contains("Tierart: —");
  }
}
