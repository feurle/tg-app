package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.ArticleState;

import java.time.LocalDateTime;
import java.util.List;

public record UpdateArticleRequest(
        String title,
        String content,
        ArticleState state,
        LocalDateTime publishedDate,
        List<Long> imageIds
) {}