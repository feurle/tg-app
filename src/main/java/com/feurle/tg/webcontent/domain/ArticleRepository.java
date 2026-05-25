// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import java.util.List;
import java.util.Optional;

public interface ArticleRepository {
  List<Article> findAll();

  List<Article> findByPageId(Long pageId);

  List<Article> findByPage_Slug(String slug);

  List<Article> findByPageIdAndState(Long pageId, ArticleState state);

  List<Article> findByPageIdAndStateAndLanguage(Long pageId, ArticleState state, Language language);

  List<Article> findByPageType(PageType pageType);

  List<Article> findByPageTypeAndState(PageType pageType, ArticleState state);

  List<Article> findByPageTypeAndStateAndLanguage(
      PageType pageType, ArticleState state, Language language);

  Optional<Article> findById(Long id);

  Article save(Article article);

  void deleteById(Long id);
}
