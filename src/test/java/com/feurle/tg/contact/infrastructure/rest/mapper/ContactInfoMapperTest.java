// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest.mapper;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.OfficeHour;
import com.feurle.tg.contact.infrastructure.rest.dto.ContactInfoResponse;
import com.feurle.tg.contact.infrastructure.rest.dto.OfficeHourDto;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ContactInfoMapperTest {

  private ContactInfoMapper mapper;

  @BeforeEach
  void setUp() {
    mapper = new ContactInfoMapper();
  }

  @Test
  void toResponse_mapsAllFields() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setName("Tiergesund Praxis");
    contactInfo.setPhone("+49 89 123456");
    contactInfo.setEmail("praxis@example.de");
    contactInfo.setStreet("Musterstr. 1");
    contactInfo.setCity("München");
    contactInfo.setZip("80331");
    contactInfo.setPrimary(true);
    LocalDateTime now = LocalDateTime.now();
    contactInfo.setUpdatedAt(now);

    ContactInfoResponse response = mapper.toResponse(contactInfo);

    assertThat(response.name()).isEqualTo("Tiergesund Praxis");
    assertThat(response.phone()).isEqualTo("+49 89 123456");
    assertThat(response.email()).isEqualTo("praxis@example.de");
    assertThat(response.street()).isEqualTo("Musterstr. 1");
    assertThat(response.city()).isEqualTo("München");
    assertThat(response.zip()).isEqualTo("80331");
    assertThat(response.primary()).isTrue();
    assertThat(response.updatedAt()).isEqualTo(now);
  }

  @Test
  void toResponse_mapsOfficeHours() {
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.getOfficeHours().add(new OfficeHour("Montag – Freitag", "09:00 – 18:00"));
    contactInfo.getOfficeHours().add(new OfficeHour("Samstag", "09:00 – 13:00"));

    ContactInfoResponse response = mapper.toResponse(contactInfo);

    assertThat(response.officeHours()).hasSize(2);
    assertThat(response.officeHours().get(0).label()).isEqualTo("Montag – Freitag");
    assertThat(response.officeHours().get(0).hours()).isEqualTo("09:00 – 18:00");
    assertThat(response.officeHours().get(1).label()).isEqualTo("Samstag");
  }

  @Test
  void toDomain_mapsOfficeHourDtos() {
    List<OfficeHourDto> dtos =
        List.of(
            new OfficeHourDto("Montag – Freitag", "09:00 – 18:00"),
            new OfficeHourDto("Samstag", "09:00 – 13:00"));

    List<OfficeHour> result = mapper.toDomain(dtos);

    assertThat(result).hasSize(2);
    assertThat(result.get(0).getLabel()).isEqualTo("Montag – Freitag");
    assertThat(result.get(0).getHours()).isEqualTo("09:00 – 18:00");
    assertThat(result.get(1).getLabel()).isEqualTo("Samstag");
  }
}
