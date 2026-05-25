// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.mapper;

import com.feurle.tg.webcontent.domain.Page;
import com.feurle.tg.webcontent.infrastructure.rest.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PageMapper {

  private final ArticleMapper articleMapper;

  public PageResponse toResponse(Page page) {
    return new PageResponse(
        page.getId(),
        page.getSlug(),
        page.getTitle(),
        page.getDescription(),
        page.getArticles().stream().map(articleMapper::toResponse).toList());
  }
}
