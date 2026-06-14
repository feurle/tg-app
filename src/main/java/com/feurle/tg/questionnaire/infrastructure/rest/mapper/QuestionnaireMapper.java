// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.questionnaire.infrastructure.rest.mapper;

import com.feurle.tg.questionnaire.domain.OwnerDetails;
import com.feurle.tg.questionnaire.domain.PetDetails;
import com.feurle.tg.questionnaire.domain.Questionnaire;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.OwnerDto;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.PetDto;
import com.feurle.tg.questionnaire.infrastructure.rest.dto.QuestionnaireResponse;
import org.springframework.stereotype.Component;

@Component
public class QuestionnaireMapper {

  public OwnerDetails toDomain(OwnerDto dto) {
    return new OwnerDetails(dto.name(), dto.email(), dto.firstPet(), dto.reasonForChoosing());
  }

  public PetDetails toDomain(PetDto dto) {
    return new PetDetails(
        dto.name(),
        dto.origin(),
        dto.breederRearing(),
        dto.historyBeforeOwner(),
        dto.ageWhenAcquired(),
        dto.ownedSince(),
        dto.neutered(),
        dto.neuteredAge(),
        dto.neuteringReason(),
        dto.behaviorChangesAfterNeutering(),
        dto.school(),
        dto.knownCommands(),
        dto.feeding(),
        dto.supplements(),
        dto.digestion(),
        dto.lastDeworming(),
        dto.bloodTest());
  }

  public QuestionnaireResponse toResponse(Questionnaire questionnaire) {
    return new QuestionnaireResponse(
        questionnaire.getId(),
        toOwnerDto(questionnaire.getOwner()),
        toPetDto(questionnaire.getPet()),
        questionnaire.getSubmittedAt());
  }

  private OwnerDto toOwnerDto(OwnerDetails owner) {
    if (owner == null) {
      return null;
    }
    return new OwnerDto(
        owner.getName(), owner.getEmail(), owner.getFirstPet(), owner.getReasonForChoosing());
  }

  private PetDto toPetDto(PetDetails pet) {
    if (pet == null) {
      return null;
    }
    return new PetDto(
        pet.getName(),
        pet.getOrigin(),
        pet.getBreederRearing(),
        pet.getHistoryBeforeOwner(),
        pet.getAgeWhenAcquired(),
        pet.getOwnedSince(),
        pet.getNeutered(),
        pet.getNeuteredAge(),
        pet.getNeuteringReason(),
        pet.getBehaviorChangesAfterNeutering(),
        pet.getSchool(),
        pet.getKnownCommands(),
        pet.getFeeding(),
        pet.getSupplements(),
        pet.getDigestion(),
        pet.getLastDeworming(),
        pet.getBloodTest());
  }
}
