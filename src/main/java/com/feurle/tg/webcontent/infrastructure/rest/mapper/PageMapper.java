// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.mapper;

import com.feurle.tg.webcontent.domain.Page;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.infrastructure.rest.dto.PageResponse;
import com.feurle.tg.webcontent.infrastructure.rest.dto.PageSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PageMapper {

  private final ArticleMapper articleMapper;

  /** The page with all of its articles, including drafts. Only for logged-in users. */
  public PageResponse toResponse(Page page) {
    return toResponse(page, false);
  }

  /**
   * @param publishedOnly leave out articles that are not {@link ArticleState#PUBLISHED}, so drafts
   *     never reach anonymous visitors
   */
  public PageResponse toResponse(Page page, boolean publishedOnly) {
    return new PageResponse(
        page.getId(),
        page.getSlug(),
        page.getTitle(),
        page.getDescription(),
        page.getArticles().stream()
            .filter(article -> !publishedOnly || article.getState() == ArticleState.PUBLISHED)
            .map(articleMapper::toResponse)
            .toList());
  }

  public PageSummaryResponse toSummary(Page page) {
    return new PageSummaryResponse(
        page.getId(), page.getSlug(), page.getTitle(), page.getDescription());
  }
}
