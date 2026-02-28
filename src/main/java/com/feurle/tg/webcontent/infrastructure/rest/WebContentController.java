package com.feurle.tg.webcontent.infrastructure.rest;

import com.feurle.tg.webcontent.application.ArticleService;
import com.feurle.tg.webcontent.application.ImageService;
import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.PageType;
import com.feurle.tg.webcontent.infrastructure.rest.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/webcontent")
@RequiredArgsConstructor
public class WebContentController {

    private final ArticleService articleService;
    private final ImageService imageService;

    // ========== Image Endpoints ==========

    @GetMapping("/images")
    public ResponseEntity<List<ImageResponse>> getAllImages() {
        return ResponseEntity.ok(imageService.getAllImages().stream()
                .map(this::toImageResponse).toList());
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageResponse> uploadImage(@RequestParam MultipartFile file) throws IOException {
        Image image = imageService.upload(file.getBytes(), file.getOriginalFilename(), file.getContentType());
        return ResponseEntity.status(HttpStatus.CREATED).body(toImageResponse(image));
    }

    @GetMapping("/images/{imageId}/download")
    public ResponseEntity<byte[]> downloadImage(@PathVariable Long imageId) {
        Image image = imageService.getImage(imageId);
        String contentType = image.getMimeType() != null ? image.getMimeType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(image.getImageData());
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        imageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    // ========== Article Endpoints ==========

    @GetMapping("/articles")
    public ResponseEntity<List<ArticleResponse>> getAllArticles() {
        return ResponseEntity.ok(articleService.getAllArticles().stream()
                .map(this::toArticleResponse).toList());
    }

    @GetMapping("/articles/page/{pageType}")
    public ResponseEntity<List<ArticleResponse>> getArticlesByPage(@PathVariable PageType pageType) {
        return ResponseEntity.ok(articleService.getArticlesByPage(pageType).stream()
                .map(this::toArticleResponse).toList());
    }

    @GetMapping("/articles/page/{pageType}/published")
    public ResponseEntity<List<ArticleResponse>> getPublishedArticlesByPage(@PathVariable PageType pageType) {
        return ResponseEntity.ok(articleService.getPublishedArticlesByPage(pageType).stream()
                .map(this::toArticleResponse).toList());
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<ArticleResponse> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(toArticleResponse(articleService.getArticleById(id)));
    }

    @PostMapping("/articles")
    public ResponseEntity<ArticleResponse> createArticle(@RequestBody CreateArticleRequest request) {
        Article article = articleService.createArticle(
                request.title(), request.content(), request.page(), request.imageIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(toArticleResponse(article));
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<ArticleResponse> updateArticle(
            @PathVariable Long id,
            @RequestBody UpdateArticleRequest request
    ) {
        Article article = articleService.updateArticle(
                id, request.title(), request.content(),
                request.state(), request.imageIds());
        return ResponseEntity.ok(toArticleResponse(article));
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Mapping ==========

    private ArticleResponse toArticleResponse(Article article) {
        List<ImageResponse> imageResponses = article.getImages().stream()
                .map(this::toImageResponse)
                .toList();
        return new ArticleResponse(
                article.getId(), article.getTitle(), article.getContent(),
                article.getState(), article.getPage(), article.getPublishedDate(),
                imageResponses, article.getCreatedAt(), article.getUpdatedAt()
        );
    }

    private ImageResponse toImageResponse(Image image) {
        return new ImageResponse(image.getId(), image.getFileName(), image.getMimeType(), image.getCreatedAt());
    }
}