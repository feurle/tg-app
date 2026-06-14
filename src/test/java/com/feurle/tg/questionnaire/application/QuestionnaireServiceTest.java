// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.application;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.questionnaire.domain.OwnerDetails;
import com.feurle.tg.questionnaire.domain.PetDetails;
import com.feurle.tg.questionnaire.domain.Questionnaire;
import com.feurle.tg.questionnaire.domain.QuestionnaireRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class QuestionnaireServiceTest {

  @Autowired private QuestionnaireService questionnaireService;

  @Autowired private QuestionnaireRepository questionnaireRepository;

  @BeforeEach
  void setUp() {
    questionnaireRepository.deleteAll();
  }

  private OwnerDetails sampleOwner() {
    return new OwnerDetails("Max Mustermann", "max@example.com", Boolean.TRUE, "Familienhund");
  }

  private PetDetails samplePet() {
    return new PetDetails(
        "Rex",
        "Vom Züchter",
        "Elterntiere gesehen",
        null,
        "8 Wochen",
        "2 Jahre",
        Boolean.FALSE,
        null,
        null,
        null,
        "Welpenschule",
        "Sitz, Platz",
        "Trockenfutter 2x täglich",
        "Keine",
        "Normal",
        "März 2026",
        "Unauffällig");
  }

  @Test
  void submit_savesAndStampsAndReturnsQuestionnaire() {
    Questionnaire saved = questionnaireService.submit(sampleOwner(), samplePet());

    assertThat(saved.getId()).isNotNull();
    assertThat(saved.getSubmittedAt()).isNotNull();
    assertThat(saved.getOwner().getName()).isEqualTo("Max Mustermann");
    assertThat(saved.getOwner().getFirstPet()).isTrue();
    assertThat(saved.getPet().getName()).isEqualTo("Rex");
    assertThat(saved.getPet().getNeutered()).isFalse();
    assertThat(saved.getPet().getFeeding()).isEqualTo("Trockenfutter 2x täglich");
  }

  @Test
  void getAll_returnsSubmissions() {
    questionnaireService.submit(sampleOwner(), samplePet());
    questionnaireService.submit(sampleOwner(), samplePet());

    List<Questionnaire> all = questionnaireService.getAll();

    assertThat(all).hasSize(2);
  }

  @Test
  void getById_returnsQuestionnaire() {
    Questionnaire created = questionnaireService.submit(sampleOwner(), samplePet());

    Questionnaire found = questionnaireService.getById(created.getId());

    assertThat(found.getId()).isEqualTo(created.getId());
    assertThat(found.getPet().getName()).isEqualTo("Rex");
  }

  @Test
  void getById_throwsWhenNotFound() {
    assertThatThrownBy(() -> questionnaireService.getById(999L))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Questionnaire not found: 999");
  }

  @Test
  void delete_removesQuestionnaire() {
    Questionnaire created = questionnaireService.submit(sampleOwner(), samplePet());

    questionnaireService.delete(created.getId());

    assertThatThrownBy(() -> questionnaireService.getById(created.getId()))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
