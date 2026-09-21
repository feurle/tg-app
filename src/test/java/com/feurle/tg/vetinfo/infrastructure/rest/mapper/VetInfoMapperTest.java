// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest.mapper;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.vetinfo.domain.OfficeHour;
import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.OfficeHourDto;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.VetInfoResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class VetInfoMapperTest {

  private VetInfoMapper mapper;

  @BeforeEach
  void setUp() {
    mapper = new VetInfoMapper();
  }

  @Test
  void toResponse_mapsAllFields() {
    VetInfo vetInfo = new VetInfo();
    vetInfo.setName("Tiergesund Praxis");
    vetInfo.setPhone("+49 89 123456");
    vetInfo.setEmail("praxis@example.de");
    vetInfo.setStreet("Musterstr. 1");
    vetInfo.setCity("München");
    vetInfo.setZip("80331");
    vetInfo.setPrimary(true);
    LocalDateTime now = LocalDateTime.now();
    vetInfo.setUpdatedAt(now);

    VetInfoResponse response = mapper.toResponse(vetInfo);

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
    VetInfo vetInfo = new VetInfo();
    vetInfo.getOfficeHours().add(new OfficeHour("Montag – Freitag", "09:00 – 18:00"));
    vetInfo.getOfficeHours().add(new OfficeHour("Samstag", "09:00 – 13:00"));

    VetInfoResponse response = mapper.toResponse(vetInfo);

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
