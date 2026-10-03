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
import com.feurle.tg.webcontent.domain.Page;
import com.feurle.tg.webcontent.domain.Tag;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.infrastructure.rest.dto.*;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.ArticleMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.ImageMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.PageMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.SectionMapper;
import com.feurle.tg.webcontent.infrastructure.rest.mapper.TagMapper;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
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

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/articles/{articleId}/sections")
  public ResponseEntity<SectionResponse> createSection(
      @PathVariable Long articleId, @Valid @RequestBody CreateSectionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            sectionMapper.toResponse(
                sectionService.createSection(
                    articleId,
                    request.order(),
                    request.title(),
                    request.content(),
                    request.imageId())));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/sections/{id}")
  public ResponseEntity<SectionResponse> updateSection(
      @PathVariable Long id, @Valid @RequestBody UpdateSectionRequest request) {
    return ResponseEntity.ok(
        sectionMapper.toResponse(
            sectionService.updateSection(
                id, request.order(), request.title(), request.content(), request.imageId())));
  }

  /**
   * Swaps a section with its neighbour within its article and returns all sections of that article
   * in their new order.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/sections/{id}/move")
  public ResponseEntity<List<SectionResponse>> moveSection(
      @PathVariable Long id, @Valid @RequestBody MoveArticleRequest request) {
    return ResponseEntity.ok(
        sectionService.moveSection(id, request.direction()).stream()
            .map(sectionMapper::toResponse)
            .toList());
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/sections/{id}")
  public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
    sectionService.deleteSection(id);
    return ResponseEntity.noContent().build();
  }

  // ========== Page Endpoints ==========

  /** All CMS pages (without articles). Not public: it feeds the admin navigation. */
  @GetMapping("/pages")
  public ResponseEntity<List<PageSummaryResponse>> getAllPages() {
    return ResponseEntity.ok(
        pageService.getAllPages().stream()
            .sorted(Comparator.comparing(Page::getId))
            .map(pageMapper::toSummary)
            .toList());
  }

  /**
   * A page with its articles. Public, but anonymous visitors only get published articles; drafts
   * and closed articles are for logged-in users (the admin area).
   */
  @GetMapping("/pages/{slug}")
  public ResponseEntity<PageResponse> getPageBySlug(
      @PathVariable String slug, Authentication authentication) {
    boolean loggedIn =
        authentication != null
            && authentication.isAuthenticated()
            && !(authentication instanceof AnonymousAuthenticationToken);
    return ResponseEntity.ok(pageMapper.toResponse(pageService.getPageBySlug(slug), !loggedIn));
  }

  // ========== Image Endpoints ==========

  @GetMapping("/images")
  public ResponseEntity<List<ImageResponse>> getAllImages() {
    return ResponseEntity.ok(
        imageService.getAllImages().stream().map(imageMapper::toResponse).toList());
  }

  @PreAuthorize("hasRole('ADMIN')")
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

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/images/{imageId}")
  public ResponseEntity<ImageResponse> updateImage(
      @PathVariable Long imageId, @Valid @RequestBody UpdateImageRequest request) {
    Image image = imageService.updateImage(imageId, request.title());
    return ResponseEntity.ok(imageMapper.toResponse(image));
  }

  @PreAuthorize("hasRole('ADMIN')")
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

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/tags")
  public ResponseEntity<TagResponse> createTag(@Valid @RequestBody CreateTagRequest request) {
    Tag tag = tagService.createTag(request.name());
    return ResponseEntity.status(HttpStatus.CREATED).body(tagMapper.toResponse(tag));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/tags/{id}")
  public ResponseEntity<TagResponse> updateTag(
      @PathVariable Long id, @Valid @RequestBody UpdateTagRequest request) {
    Tag tag = tagService.updateTag(id, request.name());
    return ResponseEntity.ok(tagMapper.toResponse(tag));
  }

  @PreAuthorize("hasRole('ADMIN')")
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

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/articles")
  public ResponseEntity<ArticleResponse> createArticle(
      @Valid @RequestBody CreateArticleRequest request) {
    Article article =
        articleService.createArticle(
            request.title(),
            request.content(),
            request.articleType(),
            request.language(),
            request.pageId(),
            request.order(),
            request.imageIds(),
            request.tagIds());
    return ResponseEntity.status(HttpStatus.CREATED).body(articleMapper.toResponse(article));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/articles/{id}")
  public ResponseEntity<ArticleResponse> updateArticle(
      @PathVariable Long id, @Valid @RequestBody UpdateArticleRequest request) {
    Article article =
        articleService.updateArticle(
            id,
            request.title(),
            request.content(),
            request.state(),
            request.language(),
            request.order(),
            request.imageIds(),
            request.tagIds());
    return ResponseEntity.ok(articleMapper.toResponse(article));
  }

  /**
   * Swaps an article with its neighbour within its page + language scope and returns that whole
   * scope in its new order, so the caller can replace its list in one go.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/articles/{id}/move")
  public ResponseEntity<List<ArticleResponse>> moveArticle(
      @PathVariable Long id, @Valid @RequestBody MoveArticleRequest request) {
    return ResponseEntity.ok(
        articleService.moveArticle(id, request.direction()).stream()
            .map(articleMapper::toResponse)
            .toList());
  }

  /**
   * Copies an article (with sections, images and tags) into another language of the same page. The
   * copy is a draft at the end of that language's list.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/articles/{id}/copy")
  public ResponseEntity<ArticleResponse> copyArticle(
      @PathVariable Long id, @RequestParam Language language) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(articleMapper.toResponse(articleService.copyArticle(id, language)));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/articles/{id}")
  public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
    articleService.deleteArticle(id);
    return ResponseEntity.noContent().build();
  }
}
