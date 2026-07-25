// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import java.util.List;
import java.util.Optional;

/**
 * All list queries sort by {@code order ASC, id ASC}. The id is a tie-breaker so that articles
 * sharing an order value (legacy seed data) still come back in a stable sequence.
 */
public interface ArticleRepository {
  List<Article> findAll();

  List<Article> findAllByOrderByOrderAscIdAsc();

  List<Article> findByPageIdOrderByOrderAscIdAsc(Long pageId);

  List<Article> findByPage_SlugOrderByOrderAscIdAsc(String slug);

  List<Article> findByPageIdAndStateOrderByOrderAscIdAsc(Long pageId, ArticleState state);

  List<Article> findByPageIdAndStateAndLanguageOrderByOrderAscIdAsc(
      Long pageId, ArticleState state, Language language);

  /** The ordering scope: every article of one page in one language. */
  List<Article> findByPageIdAndLanguageOrderByOrderAscIdAsc(Long pageId, Language language);

  /** The ordering scope for articles that are not attached to any page. */
  List<Article> findByPageIsNullAndLanguageOrderByOrderAscIdAsc(Language language);

  List<Article> findByArticleTypeOrderByOrderAscIdAsc(ArticleType articleType);

  List<Article> findByArticleTypeAndStateOrderByOrderAscIdAsc(
      ArticleType articleType, ArticleState state);

  List<Article> findByArticleTypeAndStateAndLanguageOrderByOrderAscIdAsc(
      ArticleType articleType, ArticleState state, Language language);

  Optional<Article> findById(Long id);

  Article save(Article article);

  void deleteById(Long id);
}
