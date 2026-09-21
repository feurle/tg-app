// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest.mapper;

import com.feurle.tg.vetinfo.domain.OfficeHour;
import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.OfficeHourDto;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.VetInfoResponse;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class VetInfoMapper {

  public VetInfoResponse toResponse(VetInfo vetInfo) {
    List<OfficeHourDto> officeHours =
        vetInfo.getOfficeHours().stream()
            .map(oh -> new OfficeHourDto(oh.getLabel(), oh.getHours()))
            .toList();
    return new VetInfoResponse(
        vetInfo.getId(),
        vetInfo.getName(),
        vetInfo.getPhone(),
        vetInfo.getEmail(),
        vetInfo.getStreet(),
        vetInfo.getCity(),
        vetInfo.getZip(),
        vetInfo.isPrimary(),
        officeHours,
        vetInfo.getUpdatedAt());
  }

  public List<OfficeHour> toDomain(List<OfficeHourDto> dtos) {
    return dtos.stream().map(dto -> new OfficeHour(dto.label(), dto.hours())).toList();
  }
}
