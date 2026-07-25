// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import jakarta.validation.constraints.Min;
import java.util.List;

/** {@code order} is optional — when omitted the current order is kept. */
public record UpdateArticleRequest(
    String title,
    String content,
    ArticleState state,
    Language language,
    @Min(1) Integer order,
    List<Long> imageIds,
    List<Long> tagIds) {}
