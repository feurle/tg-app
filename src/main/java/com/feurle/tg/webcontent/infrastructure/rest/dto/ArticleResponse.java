// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import java.time.LocalDateTime;
import java.util.List;

public record ArticleResponse(
    Long id,
    String title,
    String content,
    int order,
    List<SectionResponse> sections,
    ArticleState state,
    ArticleType articleType,
    Language language,
    LocalDateTime publishedDate,
    List<ImageResponse> images,
    List<TagResponse> tags,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long pageId) {}
