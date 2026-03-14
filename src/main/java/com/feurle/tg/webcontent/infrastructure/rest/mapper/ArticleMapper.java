// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.mapper;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.infrastructure.rest.dto.ArticleResponse;
import com.feurle.tg.webcontent.infrastructure.rest.dto.ImageResponse;
import com.feurle.tg.webcontent.infrastructure.rest.dto.TagResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ArticleMapper {

  private final ImageMapper imageMapper;
  private final TagMapper tagMapper;

  public ArticleResponse toResponse(Article article) {
    List<ImageResponse> imageResponses =
        article.getImages().stream().map(imageMapper::toResponse).toList();
    List<TagResponse> tagResponses =
        article.getTags().stream().map(tagMapper::toResponse).toList();
    return new ArticleResponse(
        article.getId(),
        article.getTitle(),
        article.getContent(),
        article.getState(),
        article.getPage(),
        article.getLanguage(),
        article.getPublishedDate(),
        imageResponses,
        tagResponses,
        article.getCreatedAt(),
        article.getUpdatedAt());
  }
}
