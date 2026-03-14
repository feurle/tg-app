// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.mapper;

import com.feurle.tg.webcontent.domain.Tag;
import com.feurle.tg.webcontent.infrastructure.rest.dto.TagResponse;
import org.springframework.stereotype.Component;

@Component
public class TagMapper {

  public TagResponse toResponse(Tag tag) {
    return new TagResponse(tag.getId(), tag.getName());
  }
}
