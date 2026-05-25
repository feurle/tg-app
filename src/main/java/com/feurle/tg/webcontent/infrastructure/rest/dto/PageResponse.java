// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

import java.util.List;

public record PageResponse(
    Long id, String slug, String title, String description, List<ArticleResponse> articles) {}
