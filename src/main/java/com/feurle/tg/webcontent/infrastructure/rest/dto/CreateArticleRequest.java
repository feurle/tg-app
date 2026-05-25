// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import java.util.List;

public record CreateArticleRequest(
    String title,
    String content,
    PageType pageType,
    Language language,
    Long pageId,
    List<Long> imageIds,
    List<Long> tagIds) {}
