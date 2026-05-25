// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.mapper;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.infrastructure.rest.dto.ArticleResponse;
import com.feurle.tg.webcontent.infrastructure.rest.dto.ImageResponse;
import com.feurle.tg.webcontent.infrastructure.rest.dto.SectionResponse;
import com.feurle.tg.webcontent.infrastructure.rest.dto.TagResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ArticleMapper {

  private final SectionMapper sectionMapper;
  private final ImageMapper imageMapper;
  private final TagMapper tagMapper;

  public ArticleResponse toResponse(Article article) {
    List<SectionResponse> sectionResponses =
        article.getSections().stream().map(sectionMapper::toResponse).toList();
    List<ImageResponse> imageResponses =
        article.getImages().stream().map(imageMapper::toResponse).toList();
    List<TagResponse> tagResponses = article.getTags().stream().map(tagMapper::toResponse).toList();
    Long pageId = article.getPage() != null ? article.getPage().getId() : null;
    return new ArticleResponse(
        article.getId(),
        article.getTitle(),
        article.getContent(),
        article.getOrder(),
        sectionResponses,
        article.getState(),
        article.getPageType(),
        article.getLanguage(),
        article.getPublishedDate(),
        imageResponses,
        tagResponses,
        article.getCreatedAt(),
        article.getUpdatedAt(),
        pageId);
  }
}
