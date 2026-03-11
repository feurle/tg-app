// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import com.feurle.tg.webcontent.application.ArticleService;
import com.feurle.tg.webcontent.application.ImageService;
import com.feurle.tg.webcontent.application.TagService;
import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.Tag;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import com.feurle.tg.webcontent.infrastructure.rest.dto.*;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/webcontent")
@RequiredArgsConstructor
public class WebContentController {

  private final ArticleService articleService;
  private final ImageService imageService;
  private final TagService tagService;

  // ========== Image Endpoints ==========

  @GetMapping("/images")
  public ResponseEntity<List<ImageResponse>> getAllImages() {
    return ResponseEntity.ok(
        imageService.getAllImages().stream().map(this::mapToImageResponse).toList());
  }

  @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ImageResponse> uploadImage(@RequestParam MultipartFile file)
      throws IOException {
    Image image =
        imageService.upload(file.getBytes(), file.getOriginalFilename(), file.getContentType());
    return ResponseEntity.status(HttpStatus.CREATED).body(mapToImageResponse(image));
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

  @DeleteMapping("/images/{imageId}")
  public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
    imageService.deleteImage(imageId);
    return ResponseEntity.noContent().build();
  }

  // ========== Tag Endpoints ==========

  @GetMapping("/tags")
  public ResponseEntity<List<TagResponse>> getAllTags() {
    return ResponseEntity.ok(tagService.getAllTags().stream().map(this::mapToTagResponse).toList());
  }

  @GetMapping("/tags/{id}")
  public ResponseEntity<TagResponse> getTag(@PathVariable Long id) {
    return ResponseEntity.ok(mapToTagResponse(tagService.getTag(id)));
  }

  @PostMapping("/tags")
  public ResponseEntity<TagResponse> createTag(@RequestBody CreateTagRequest request) {
    Tag tag = tagService.createTag(request.name());
    return ResponseEntity.status(HttpStatus.CREATED).body(mapToTagResponse(tag));
  }

  @PutMapping("/tags/{id}")
  public ResponseEntity<TagResponse> updateTag(
      @PathVariable Long id, @RequestBody UpdateTagRequest request) {
    Tag tag = tagService.updateTag(id, request.name());
    return ResponseEntity.ok(mapToTagResponse(tag));
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
        articleService.getAllArticles().stream().map(this::mapToArticleResponse).toList());
  }

  @GetMapping("/articles/page/{pageType}")
  public ResponseEntity<List<ArticleResponse>> getArticlesByPage(@PathVariable PageType pageType) {
    return ResponseEntity.ok(
        articleService.getArticlesByPage(pageType).stream().map(this::mapToArticleResponse).toList());
  }

  @GetMapping("/articles/page/{pageType}/published")
  public ResponseEntity<List<ArticleResponse>> getPublishedArticlesByPage(
      @PathVariable PageType pageType, @RequestParam(required = false) Language language) {
    List<Article> articles;
    if (language != null) {
      articles = articleService.getPublishedArticlesByPageAndLanguage(pageType, language);
    } else {
      articles = articleService.getPublishedArticlesByPage(pageType);
    }
    return ResponseEntity.ok(articles.stream().map(this::mapToArticleResponse).toList());
  }

  @GetMapping("/articles/{id}")
  public ResponseEntity<ArticleResponse> getArticleById(@PathVariable Long id) {
    return ResponseEntity.ok(mapToArticleResponse(articleService.getArticleById(id)));
  }

  @PostMapping("/articles")
  public ResponseEntity<ArticleResponse> createArticle(@RequestBody CreateArticleRequest request) {
    Article article =
        articleService.createArticle(
            request.title(),
            request.content(),
            request.page(),
            request.language(),
            request.imageIds(),
            request.tagIds());
    return ResponseEntity.status(HttpStatus.CREATED).body(mapToArticleResponse(article));
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
    return ResponseEntity.ok(mapToArticleResponse(article));
  }

  @DeleteMapping("/articles/{id}")
  public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
    articleService.deleteArticle(id);
    return ResponseEntity.noContent().build();
  }

  // ========== Mapping ==========

  private ArticleResponse mapToArticleResponse(Article article) {
    List<ImageResponse> imageResponses =
        article.getImages().stream().map(this::mapToImageResponse).toList();
    List<TagResponse> tagResponses = article.getTags().stream().map(this::mapToTagResponse).toList();
    return new ArticleResponse(
        article.getId(),
        article.getTitle(),
        article.getContent(),
        article.getState(),
        article.getPage(),
        article.getLanguage(),
        article.getPublishedDate(),
        imageResponses,
        tagResponses,
        article.getCreatedAt(),
        article.getUpdatedAt());
  }

  private ImageResponse mapToImageResponse(Image image) {
    return new ImageResponse(
        image.getId(), image.getFileName(), image.getMimeType(), image.getCreatedAt());
  }

  private TagResponse mapToTagResponse(Tag tag) {
    return new TagResponse(tag.getId(), tag.getName());
  }
}
