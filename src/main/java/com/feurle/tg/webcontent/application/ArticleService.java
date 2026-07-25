// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.*;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.MoveDirection;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class ArticleService {

  private final ArticleRepository articleRepository;
  private final PageRepository pageRepository;
  private final ImageRepository imageRepository;
  private final TagRepository tagRepository;

  public List<Article> getAllArticles() {
    return articleRepository.findAllByOrderByOrderAscIdAsc();
  }

  public List<Article> getArticlesByPageSlug(String slug) {
    return articleRepository.findByPage_SlugOrderByOrderAscIdAsc(slug);
  }

  public List<Article> getPublishedArticlesByPageSlug(String slug) {
    return articleRepository.findByPage_SlugOrderByOrderAscIdAsc(slug).stream()
        .filter(a -> a.getState() == ArticleState.PUBLISHED)
        .toList();
  }

  public List<Article> getPublishedArticlesByPageSlugAndLanguage(String slug, Language language) {
    return articleRepository.findByPage_SlugOrderByOrderAscIdAsc(slug).stream()
        .filter(a -> a.getState() == ArticleState.PUBLISHED && a.getLanguage() == language)
        .toList();
  }

  public List<Article> getArticlesByArticleType(ArticleType articleType) {
    return articleRepository.findByArticleTypeOrderByOrderAscIdAsc(articleType);
  }

  public List<Article> getPublishedArticlesByArticleType(ArticleType articleType) {
    return articleRepository.findByArticleTypeAndStateOrderByOrderAscIdAsc(
        articleType, ArticleState.PUBLISHED);
  }

  public List<Article> getPublishedArticlesByArticleTypeAndLanguage(
      ArticleType articleType, Language language) {
    return articleRepository.findByArticleTypeAndStateAndLanguageOrderByOrderAscIdAsc(
        articleType, ArticleState.PUBLISHED, language);
  }

  public Article getArticleById(Long id) {
    return articleRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));
  }

  public Article createArticle(
      String title,
      String content,
      ArticleType articleType,
      Language language,
      Long pageId,
      Integer order,
      List<Long> imageIds,
      List<Long> tagIds) {
    Article article = new Article();
    article.setTitle(title);
    article.setContent(content);
    article.setArticleType(articleType);
    article.setLanguage(language != null ? language : Language.GERMAN);
    article.setState(ArticleState.CREATED);

    if (pageId != null) {
      Page page =
          pageRepository
              .findById(pageId)
              .orElseThrow(() -> new NoSuchElementException("Page not found: " + pageId));
      article.setPage(page);
    }

    // No explicit order means "append at the end of this page + language".
    article.setOrder(order != null ? order : nextOrder(pageId, article.getLanguage()));

    if (imageIds != null && !imageIds.isEmpty()) {
      article.setImages(imageRepository.findAllById(imageIds));
    }

    if (tagIds != null && !tagIds.isEmpty()) {
      article.setTags(tagRepository.findAllById(tagIds));
    }

    return articleRepository.save(article);
  }

  public Article updateArticle(
      Long id,
      String title,
      String content,
      ArticleState state,
      Language language,
      Integer order,
      List<Long> imageIds,
      List<Long> tagIds) {
    Article article =
        articleRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));

    article.setTitle(title);
    article.setContent(content);
    if (language != null) {
      article.setLanguage(language);
    }

    if (order != null) {
      article.setOrder(order);
    }

    // Auto-set publishedDate when transitioning to PUBLISHED status
    if (state == ArticleState.PUBLISHED && article.getState() != ArticleState.PUBLISHED) {
      article.setPublishedDate(LocalDateTime.now());
    }

    article.setState(state);

    if (imageIds != null) {
      article.setImages(
          imageIds.isEmpty() ? new ArrayList<>() : imageRepository.findAllById(imageIds));
    }

    if (tagIds != null) {
      article.setTags(tagIds.isEmpty() ? new ArrayList<>() : tagRepository.findAllById(tagIds));
    }

    return articleRepository.save(article);
  }

  public void deleteArticle(Long id) {
    articleRepository.deleteById(id);
  }

  /**
   * Swaps an article with its neighbour inside its own page + language scope and returns the whole
   * scope in its new order. Moving past either end is a no-op.
   */
  public List<Article> moveArticle(Long id, MoveDirection direction) {
    Article article =
        articleRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));

    List<Article> scope = normalizeScope(pageIdOf(article), article.getLanguage());
    int index = indexOf(scope, id);
    int target = direction == MoveDirection.UP ? index - 1 : index + 1;
    if (target < 0 || target >= scope.size()) {
      return scope;
    }

    Article current = scope.get(index);
    Article neighbour = scope.get(target);
    int currentOrder = current.getOrder();
    current.setOrder(neighbour.getOrder());
    neighbour.setOrder(currentOrder);
    articleRepository.save(current);
    articleRepository.save(neighbour);

    scope.set(index, neighbour);
    scope.set(target, current);
    return scope;
  }

  /** The next free order value at the end of a page + language scope. */
  private int nextOrder(Long pageId, Language language) {
    return scope(pageId, language).stream().mapToInt(Article::getOrder).max().orElse(0) + 1;
  }

  /**
   * Renumbers a scope to a gapless 1..N sequence. Existing content was seeded with duplicate order
   * values (and everything created through the UI before this feature landed has order 0), so the
   * scope is repaired before any swap happens.
   */
  private List<Article> normalizeScope(Long pageId, Language language) {
    List<Article> scope = new ArrayList<>(scope(pageId, language));
    for (int i = 0; i < scope.size(); i++) {
      Article article = scope.get(i);
      if (article.getOrder() != i + 1) {
        article.setOrder(i + 1);
        articleRepository.save(article);
      }
    }
    return scope;
  }

  private List<Article> scope(Long pageId, Language language) {
    return pageId == null
        ? articleRepository.findByPageIsNullAndLanguageOrderByOrderAscIdAsc(language)
        : articleRepository.findByPageIdAndLanguageOrderByOrderAscIdAsc(pageId, language);
  }

  private static Long pageIdOf(Article article) {
    return article.getPage() != null ? article.getPage().getId() : null;
  }

  private static int indexOf(List<Article> scope, Long id) {
    for (int i = 0; i < scope.size(); i++) {
      if (scope.get(i).getId().equals(id)) {
        return i;
      }
    }
    throw new IllegalStateException("Article " + id + " is missing from its own ordering scope");
  }
}
