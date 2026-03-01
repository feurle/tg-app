package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;

import java.util.List;

public record CreateArticleRequest(
        String title,
        String content,
        PageType page,
        Language language,
        List<Long> imageIds
) {}