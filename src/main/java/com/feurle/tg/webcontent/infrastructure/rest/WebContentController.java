// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import com.feurle.tg.webcontent.application.ArticleService;
import com.feurle.tg.webcontent.application.ImageService;
import com.feurle.tg.webcontent.application.PageService;
import com.feurle.tg.webcontent.application.SectionService;
import com.feurle.tg.webcontent.application.TagService;
import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.Tag;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.infrastructure.rest.dto.*;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.ArticleMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.ImageMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.PageMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.SectionMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.TagMapper;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/webcontent")
@RequiredArgsConstructor
public class WebContentController {

  private final ArticleService articleService;
  private final ImageService imageService;
  private final TagService tagService;
  private final PageService pageService;
  private final SectionService sectionService;
  private final ArticleMapper articleMapper;
  private final ImageMapper imageMapper;
  private final TagMapper tagMapper;
  private final PageMapper pageMapper;
  private final SectionMapper sectionMapper;

  // ========== Section Endpoints ==========

  @PostMapping("/articles/{articleId}/sections")
  public ResponseEntity<SectionResponse> createSection(
      @PathVariable Long articleId, @RequestBody CreateSectionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            sectionMapper.toResponse(
                sectionService.createSection(
                    articleId, request.order(), request.title(), request.content())));
  }

  @PutMapping("/sections/{id}")
  public ResponseEntity<SectionResponse> updateSection(
      @PathVariable Long id, @RequestBody UpdateSectionRequest request) {
    return ResponseEntity.ok(
        sectionMapper.toResponse(
            sectionService.updateSection(id, request.order(), request.title(), request.content())));
  }

  @DeleteMapping("/sections/{id}")
  public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
    sectionService.deleteSection(id);
    return ResponseEntity.noContent().build();
  }

  // ========== Page Endpoints ==========

  @GetMapping("/pages/{slug}")
  public ResponseEntity<PageResponse> getPageBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(pageMapper.toResponse(pageService.getPageBySlug(slug)));
  }

  // ========== Image Endpoints ==========

  @GetMapping("/images")
  public ResponseEntity<List<ImageResponse>> getAllImages() {
    return ResponseEntity.ok(
        imageService.getAllImages().stream().map(imageMapper::toResponse).toList());
  }

  @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ImageResponse> uploadImage(
      @RequestParam MultipartFile file, @RequestParam(required = false) String title)
      throws IOException {
    Image image =
        imageService.upload(
            file.getBytes(), file.getOriginalFilename(), file.getContentType(), title);
    return ResponseEntity.status(HttpStatus.CREATED).body(imageMapper.toResponse(image));
  }

  @GetMapping("/images/{imageId}/download")
  public ResponseEntity<byte[]> downloadImage(@PathVariable Long imageId) {
    Image image = imageService.getImage(imageId);
    String contentType =
        image.getMimeType() != null
            ? image.getMimeType()
            : MediaType.APPLICATION_OCTET_STREAM_VALUE;
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, contentType)
        .body(image.getImageData());
  }

  @PutMapping("/images/{imageId}")
  public ResponseEntity<ImageResponse> updateImage(
      @PathVariable Long imageId, @RequestBody UpdateImageRequest request) {
    Image image = imageService.updateImage(imageId, request.title());
    return ResponseEntity.ok(imageMapper.toResponse(image));
  }

  @DeleteMapping("/images/{imageId}")
  public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
    imageService.deleteImage(imageId);
    return ResponseEntity.noContent().build();
  }

  // ========== Tag Endpoints ==========

  @GetMapping("/tags")
  public ResponseEntity<List<TagResponse>> getAllTags() {
    return ResponseEntity.ok(tagService.getAllTags().stream().map(tagMapper::toResponse).toList());
  }

  @GetMapping("/tags/{id}")
  public ResponseEntity<TagResponse> getTag(@PathVariable Long id) {
    return ResponseEntity.ok(tagMapper.toResponse(tagService.getTag(id)));
  }

  @PostMapping("/tags")
  public ResponseEntity<TagResponse> createTag(@RequestBody CreateTagRequest request) {
    Tag tag = tagService.createTag(request.name());
    return ResponseEntity.status(HttpStatus.CREATED).body(tagMapper.toResponse(tag));
  }

  @PutMapping("/tags/{id}")
  public ResponseEntity<TagResponse> updateTag(
      @PathVariable Long id, @RequestBody UpdateTagRequest request) {
    Tag tag = tagService.updateTag(id, request.name());
    return ResponseEntity.ok(tagMapper.toResponse(tag));
  }

  @DeleteMapping("/tags/{id}")
  public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
    tagService.deleteTag(id);
    return ResponseEntity.noContent().build();
  }

  // ========== Article Endpoints ==========

  @GetMapping("/articles")
  public ResponseEntity<List<ArticleResponse>> getAllArticles() {
    return ResponseEntity.ok(
        articleService.getAllArticles().stream().map(articleMapper::toResponse).toList());
  }

  @GetMapping("/articles/page/{slug}")
  public ResponseEntity<List<ArticleResponse>> getArticlesByPage(@PathVariable String slug) {
    log.info("getArticlesByPage slug:{}", slug);
    return ResponseEntity.ok(
        articleService.getArticlesByPageSlug(slug).stream()
            .map(articleMapper::toResponse)
            .toList());
  }

  @GetMapping("/articles/page/{slug}/published")
  public ResponseEntity<List<ArticleResponse>> getPublishedArticlesByPage(
      @PathVariable String slug, @RequestParam(required = false) Language language) {
    List<Article> articles;
    if (language != null) {
      articles = articleService.getPublishedArticlesByPageSlugAndLanguage(slug, language);
    } else {
      articles = articleService.getPublishedArticlesByPageSlug(slug);
    }
    return ResponseEntity.ok(articles.stream().map(articleMapper::toResponse).toList());
  }

  @GetMapping("/articles/pagetype/{articleType}")
  public ResponseEntity<List<ArticleResponse>> getArticlesByPageType(
      @PathVariable ArticleType articleType) {
    return ResponseEntity.ok(
        articleService.getArticlesByArticleType(articleType).stream()
            .map(articleMapper::toResponse)
            .toList());
  }

  @GetMapping("/articles/pagetype/{articleType}/published")
  public ResponseEntity<List<ArticleResponse>> getPublishedArticlesByPageType(
      @PathVariable ArticleType articleType, @RequestParam(required = false) Language language) {
    List<Article> articles;
    if (language != null) {
      articles = articleService.getPublishedArticlesByArticleTypeAndLanguage(articleType, language);
    } else {
      articles = articleService.getPublishedArticlesByArticleType(articleType);
    }
    return ResponseEntity.ok(articles.stream().map(articleMapper::toResponse).toList());
  }

  @GetMapping("/articles/{id}")
  public ResponseEntity<ArticleResponse> getArticleById(@PathVariable Long id) {
    return ResponseEntity.ok(articleMapper.toResponse(articleService.getArticleById(id)));
  }

  @PostMapping("/articles")
  public ResponseEntity<ArticleResponse> createArticle(@RequestBody CreateArticleRequest request) {
    Article article =
        articleService.createArticle(
            request.title(),
            request.content(),
            request.articleType(),
            request.language(),
            request.pageId(),
            request.imageIds(),
            request.tagIds());
    return ResponseEntity.status(HttpStatus.CREATED).body(articleMapper.toResponse(article));
  }

  @PutMapping("/articles/{id}")
  public ResponseEntity<ArticleResponse> updateArticle(
      @PathVariable Long id, @RequestBody UpdateArticleRequest request) {
    Article article =
        articleService.updateArticle(
            id,
            request.title(),
            request.content(),
            request.state(),
            request.language(),
            request.imageIds(),
            request.tagIds());
    return ResponseEntity.ok(articleMapper.toResponse(article));
  }

  @DeleteMapping("/articles/{id}")
  public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
    articleService.deleteArticle(id);
    return ResponseEntity.noContent().build();
  }
}
