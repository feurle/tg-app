package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;

import java.util.List;

public record UpdateArticleRequest(
        String title,
        String content,
        ArticleState state,
        Language language,
        List<Long> imageIds
) {}