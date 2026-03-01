package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;

import java.util.List;

public record UpdateArticleRequest(
        String title,
        String content,
        ArticleState state,
        List<Long> imageIds
) {}