// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import jakarta.validation.constraints.Min;
import java.util.List;

/**
 * {@code order} is optional — when omitted the article is appended to its page + language scope.
 */
public record CreateArticleRequest(
    String title,
    String content,
    ArticleType articleType,
    Language language,
    Long pageId,
    @Min(1) Integer order,
    List<Long> imageIds,
    List<Long> tagIds) {}
