// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest.mapper;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.OfficeHour;
import com.feurle.tg.contact.infrastructure.rest.dto.ContactInfoResponse;
import com.feurle.tg.contact.infrastructure.rest.dto.OfficeHourDto;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ContactInfoMapper {

  public ContactInfoResponse toResponse(ContactInfo contactInfo) {
    List<OfficeHourDto> officeHours =
        contactInfo.getOfficeHours().stream()
            .map(oh -> new OfficeHourDto(oh.getLabel(), oh.getHours()))
            .toList();
    return new ContactInfoResponse(
        contactInfo.getId(),
        contactInfo.getName(),
        contactInfo.getPhone(),
        contactInfo.getEmail(),
        contactInfo.getStreet(),
        contactInfo.getCity(),
        contactInfo.getZip(),
        officeHours,
        contactInfo.getUpdatedAt());
  }

  public List<OfficeHour> toDomain(List<OfficeHourDto> dtos) {
    return dtos.stream().map(dto -> new OfficeHour(dto.label(), dto.hours())).toList();
  }
}
