// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.rest.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.feurle.tg.questionnaire.domain.PetDetails;
import com.feurle.tg.questionnaire.domain.Questionnaire;
import com.feurle.tg.questionnaire.domain.Species;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.PetDto;
import org.junit.jupiter.api.Test;

class QuestionnaireMapperTest {

  private final QuestionnaireMapper mapper = new QuestionnaireMapper();

  @Test
  void toDomain_keepsSpecies() {
    PetDto dto =
        new PetDto(
            "Minka",
            Species.CAT,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);

    PetDetails pet = mapper.toDomain(dto);

    assertThat(pet.getName()).isEqualTo("Minka");
    assertThat(pet.getSpecies()).isEqualTo(Species.CAT);
  }

  @Test
  void toResponse_exposesSpecies() {
    Questionnaire questionnaire = new Questionnaire();
    PetDetails pet = new PetDetails();
    pet.setName("Fritzi");
    pet.setSpecies(Species.SMALL_ANIMAL);
    questionnaire.setPet(pet);

    assertThat(mapper.toResponse(questionnaire).pet().species()).isEqualTo(Species.SMALL_ANIMAL);
  }
}
