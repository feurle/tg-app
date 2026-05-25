// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.*;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
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
    return articleRepository.findAll();
  }

  public List<Article> getArticlesByPageSlug(String slug) {
    return articleRepository.findByPage_Slug(slug);
  }

  public List<Article> getPublishedArticlesByPageSlug(String slug) {
    return articleRepository.findByPage_Slug(slug).stream()
        .filter(a -> a.getState() == ArticleState.PUBLISHED)
        .toList();
  }

  public List<Article> getPublishedArticlesByPageSlugAndLanguage(String slug, Language language) {
    return articleRepository.findByPage_Slug(slug).stream()
        .filter(a -> a.getState() == ArticleState.PUBLISHED && a.getLanguage() == language)
        .toList();
  }

  public List<Article> getArticlesByArticleType(ArticleType articleType) {
    return articleRepository.findByArticleType(articleType);
  }

  public List<Article> getPublishedArticlesByArticleType(ArticleType articleType) {
    return articleRepository.findByArticleTypeAndState(articleType, ArticleState.PUBLISHED);
  }

  public List<Article> getPublishedArticlesByArticleTypeAndLanguage(
          ArticleType articleType, Language language) {
    return articleRepository.findByArticleTypeAndStateAndLanguage(
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
}
