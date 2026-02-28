package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.ArticleState;
import com.feurle.tg.webcontent.domain.PageType;

import java.time.LocalDateTime;
import java.util.List;

public record ArticleResponse(
        Long id,
        String title,
        String content,
        ArticleState state,
        PageType page,
        LocalDateTime publishedDate,
        List<ImageResponse> images,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}