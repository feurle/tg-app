// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.mapper;

import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.infrastructure.rest.dto.SectionResponse;
import org.springframework.stereotype.Component;

@Component
public class SectionMapper {
  public SectionResponse toResponse(Section section) {
    return new SectionResponse(
        section.getId(), section.getOrder(), section.getTitle(), section.getContent());
  }
}
