// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.*;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class ArticleService {

  private final ArticleRepository articleRepository;
  private final ImageRepository imageRepository;
  private final TagRepository tagRepository;

  public List<Article> getAllArticles() {
    return articleRepository.findAll();
  }

  public List<Article> getArticlesByPage(PageType page) {
    return articleRepository.findByPage(page);
  }

  public List<Article> getPublishedArticlesByPage(PageType page) {
    return articleRepository.findByPageAndState(page, ArticleState.PUBLISHED);
  }

  public List<Article> getPublishedArticlesByPageAndLanguage(PageType page, Language language) {
    return articleRepository.findByPageAndStateAndLanguage(page, ArticleState.PUBLISHED, language);
  }

  public Article getArticleById(Long id) {
    return articleRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));
  }

  public Article createArticle(
      String title,
      String content,
      PageType page,
      Language language,
      List<Long> imageIds,
      List<Long> tagIds) {
    Article article = new Article();
    article.setTitle(title);
    article.setContent(content);
    article.setPage(page);
    article.setLanguage(language != null ? language : Language.GERMAN);
    article.setState(ArticleState.CREATED);

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
