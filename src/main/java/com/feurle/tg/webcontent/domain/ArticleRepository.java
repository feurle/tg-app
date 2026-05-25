// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import java.util.List;
import java.util.Optional;

public interface ArticleRepository {
  List<Article> findAll();

  List<Article> findByPageId(Long pageId);

  List<Article> findByPage_Slug(String slug);

  List<Article> findByPageIdAndState(Long pageId, ArticleState state);

  List<Article> findByPageIdAndStateAndLanguage(Long pageId, ArticleState state, Language language);

  List<Article> findByArticleType(ArticleType articleType);

  List<Article> findByArticleTypeAndState(ArticleType articleType, ArticleState state);

  List<Article> findByArticleTypeAndStateAndLanguage(
          ArticleType articleType, ArticleState state, Language language);

  Optional<Article> findById(Long id);

  Article save(Article article);

  void deleteById(Long id);
}
