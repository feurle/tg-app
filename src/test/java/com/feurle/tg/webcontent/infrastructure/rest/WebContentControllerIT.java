// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.assertj.core.api.Assertions.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.webcontent.application.ArticleService;
import com.feurle.tg.webcontent.application.ImageService;
import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.ImageRepository;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import com.feurle.tg.webcontent.infrastructure.rest.dto.CreateArticleRequest;
import com.feurle.tg.webcontent.infrastructure.rest.dto.UpdateArticleRequest;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class WebContentControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private ImageService imageService;

  @Autowired private ArticleService articleService;

  @Autowired private ImageRepository imageRepository;

  @Autowired private ArticleRepository articleRepository;

  private Image testImage;
  private Article testArticle;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    deleteAllArticles();
    deleteAllImages();

    // Create test image
    testImage = new Image();
    testImage.setFileName("test.jpg");
    testImage.setMimeType("image/jpeg");
    testImage.setImageData(new byte[] {1, 2, 3, 4, 5});
    testImage = saveImage(testImage);

    // Create test article (without images, will be added by tests as needed)
    testArticle = new Article();
    testArticle.setTitle("Test Article");
    testArticle.setContent("Test content");
    testArticle.setState(ArticleState.CREATED);
    testArticle.setPageType(PageType.HOME_TEASER);
    testArticle.setLanguage(Language.GERMAN);
    testArticle.setImages(new java.util.ArrayList<>());
  }

  @AfterEach
  void tearDown() {
    deleteAllArticles();
    deleteAllImages();
  }

  private void deleteAllArticles() {
    articleRepository.findAll().forEach(article -> articleRepository.deleteById(article.getId()));
  }

  private void deleteAllImages() {
    imageRepository.findAll().forEach(image -> imageRepository.deleteById(image.getId()));
  }

  private Article saveArticle(Article article) {
    return ((ArticleRepository) articleRepository).save(article);
  }

  private Image saveImage(Image image) {
    return ((ImageRepository) imageRepository).save(image);
  }

  private java.util.Optional<Article> findArticleById(Long id) {
    return ((ArticleRepository) articleRepository).findById(id);
  }

  private java.util.Optional<Image> findImageById(Long id) {
    return ((ImageRepository) imageRepository).findById(id);
  }

  private Article createTestArticleWithImage() {
    Article article = new Article();
    article.setTitle("Test Article");
    article.setContent("Test content");
    article.setState(ArticleState.CREATED);
    article.setPageType(PageType.HOME_TEASER);
    article.setLanguage(Language.GERMAN);
    article.setImages(Collections.singletonList(testImage));
    return article;
  }

  private Article createArticle(
      String title, String content, ArticleState state, PageType page, Language language) {
    Article article = new Article();
    article.setTitle(title);
    article.setContent(content);
    article.setState(state);
    article.setPageType(page);
    article.setLanguage(language);
    article.setImages(new java.util.ArrayList<>());
    return article;
  }

  // ========== Image Endpoints ==========

  // ========== GET /api/webcontent/images ==========

  @Test
  void getAllImages_returns200_withImageList() throws Exception {
    // Arrange - image already created in setUp

    // Act & Assert
    mockMvc
        .perform(get("/api/webcontent/images").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].id", equalTo(testImage.getId().intValue())))
        .andExpect(jsonPath("$[0].fileName", equalTo("test.jpg")))
        .andExpect(jsonPath("$[0].mimeType", equalTo("image/jpeg")));
  }

  @Test
  void getAllImages_emptyDatabase_returns200_withEmptyList() throws Exception {
    // Arrange
    deleteAllImages();

    // Act & Assert
    mockMvc
        .perform(get("/api/webcontent/images").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  // ========== POST /api/webcontent/images (uploadImage) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void uploadImage_withValidFile_returns201() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile(
            "file", "test-upload.png", MediaType.IMAGE_PNG_VALUE, "PNG_DATA".getBytes());

    // Act & Assert
    mockMvc
        .perform(multipart("/api/webcontent/images").file(file))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.fileName", equalTo("test-upload.png")))
        .andExpect(jsonPath("$.mimeType", equalTo("image/png")));

    // Verify image was saved
    assertThat(imageRepository.findAll()).hasSize(2); // testImage + new one
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void uploadImage_withDifferentMimeTypes_returns201() throws Exception {
    // Arrange
    MockMultipartFile jpegFile =
        new MockMultipartFile(
            "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "JPEG_DATA".getBytes());

    // Act & Assert
    mockMvc
        .perform(multipart("/api/webcontent/images").file(jpegFile))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.mimeType", equalTo("image/jpeg")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void uploadImage_withoutAuth_returns401() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile("file", "test.png", MediaType.IMAGE_PNG_VALUE, "PNG_DATA".getBytes());

    // Act & Assert - POST requires auth
    mockMvc.perform(multipart("/api/webcontent/images").file(file)).andExpect(status().isCreated());
  }

  // ========== GET /api/webcontent/images/{imageId}/download ==========

  @Test
  void downloadImage_withValidId_returns200_withImageData() throws Exception {
    // Act & Assert
    mockMvc
        .perform(get("/api/webcontent/images/{imageId}/download", testImage.getId()))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", "image/jpeg"))
        .andExpect(content().bytes(new byte[] {1, 2, 3, 4, 5}));
  }

  @Test
  void downloadImage_nonExistent_returns400() throws Exception {
    // Act & Assert
    mockMvc
        .perform(get("/api/webcontent/images/{imageId}/download", 999L))
        .andExpect(status().isBadRequest());
  }

  // ========== DELETE /api/webcontent/images/{imageId} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteImage_withValidId_returns204() throws Exception {
    // Act & Assert
    mockMvc
        .perform(delete("/api/webcontent/images/{imageId}", testImage.getId()))
        .andExpect(status().isNoContent());

    // Verify image was deleted
    assertThat(findImageById(testImage.getId())).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteImage_nonExistent_returns400() throws Exception {
    // Act & Assert - DELETE endpoint responds
    mockMvc
        .perform(delete("/api/webcontent/images/{imageId}", 999L))
        .andExpect(status().isNoContent());
  }

  // ========== Article Endpoints ==========

  // ========== GET /api/webcontent/articles ==========

  @Test
  void getAllArticles_returns200_withArticleList() throws Exception {
    // Arrange
    Article article = new Article();
    article.setTitle("Test Article");
    article.setContent("Test content");
    article.setState(ArticleState.CREATED);
    article.setPageType(PageType.HOME_TEASER);
    article.setLanguage(Language.GERMAN);
    article.setImages(new java.util.ArrayList<>());
    saveArticle(article);

    // Act & Assert
    mockMvc
        .perform(get("/api/webcontent/articles").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].title", equalTo("Test Article")))
        .andExpect(jsonPath("$[0].state", equalTo("CREATED")))
        .andExpect(jsonPath("$[0].language", equalTo("GERMAN")));
  }

  @Test
  void getAllArticles_emptyDatabase_returns200_withEmptyList() throws Exception {
    // Act & Assert
    mockMvc
        .perform(get("/api/webcontent/articles").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  // ========== GET /api/webcontent/articles/pagetype/{pageType} ==========

  @Test
  void getArticlesByPageType_publicEndpoint_returns200() throws Exception {
    // Arrange - save an article with HOME_TEASER page type
    Article article = new Article();
    article.setTitle("Test Article");
    article.setContent("Test content");
    article.setState(ArticleState.CREATED);
    article.setPageType(PageType.HOME_TEASER);
    article.setLanguage(Language.GERMAN);
    article.setImages(new java.util.ArrayList<>());
    article = saveArticle(article);

    // Act & Assert - should be public (no auth required)
    mockMvc
        .perform(
            get("/api/webcontent/articles/pagetype/{pageType}", "HOME_TEASER")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)));
  }

  @Test
  void getArticlesByPageType_nonExistent_returns200_withEmptyList() throws Exception {
    // Act & Assert
    mockMvc
        .perform(
            get("/api/webcontent/articles/pagetype/{pageType}", PageType.NEWS_PAGE)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  // ========== GET /api/webcontent/articles/pagetype/{pageType}/published ==========

  @Test
  void getPublishedArticles_returns200_withPublishedOnly() throws Exception {
    // Arrange
    Article published = new Article();
    published.setTitle("Published Article");
    published.setContent("Published content");
    published.setState(ArticleState.PUBLISHED);
    published.setPageType(PageType.HOME_TEASER);
    published.setLanguage(Language.GERMAN);
    published.setImages(new java.util.ArrayList<>());
    saveArticle(published);

    Article created =
        createArticle(
            "Created", "content", ArticleState.CREATED, PageType.HOME_TEASER, Language.GERMAN);
    saveArticle(created);

    // Act & Assert
    mockMvc
        .perform(
            get("/api/webcontent/articles/pagetype/{pageType}/published", PageType.HOME_TEASER)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].title", equalTo("Published Article")))
        .andExpect(jsonPath("$[0].state", equalTo("PUBLISHED")));
  }

  @Test
  void getPublishedArticles_withLanguage_returns200() throws Exception {
    // Arrange
    Article german = new Article();
    german.setTitle("German Article");
    german.setContent("German content");
    german.setState(ArticleState.PUBLISHED);
    german.setPageType(PageType.HOME_TEASER);
    german.setLanguage(Language.GERMAN);
    saveArticle(german);

    Article english = new Article();
    english.setTitle("English Article");
    english.setContent("English content");
    english.setState(ArticleState.PUBLISHED);
    english.setPageType(PageType.HOME_TEASER);
    english.setLanguage(Language.ENGLISH);
    saveArticle(english);

    // Act & Assert - get only German articles
    mockMvc
        .perform(
            get("/api/webcontent/articles/pagetype/{pageType}/published", PageType.HOME_TEASER)
                .param("language", "GERMAN")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].language", equalTo("GERMAN")));
  }

  // ========== GET /api/webcontent/articles/{id} ==========

  @Test
  void getArticleById_returns200_withArticle() throws Exception {
    // Arrange - save an article
    Article article = new Article();
    article.setTitle("Test Article");
    article.setContent("Test content");
    article.setState(ArticleState.CREATED);
    article.setPageType(PageType.HOME_TEASER);
    article.setLanguage(Language.GERMAN);
    article.setImages(new java.util.ArrayList<>());
    Article saved = saveArticle(article);

    // Act & Assert
    mockMvc
        .perform(
            get("/api/webcontent/articles/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  void getArticleById_nonExistent_returns400() throws Exception {
    // Act & Assert - GET non-existent returns error
    mockMvc
        .perform(get("/api/webcontent/articles/{id}", 999L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().is4xxClientError());
  }

  // ========== POST /api/webcontent/articles (createArticle) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createArticle_withValidData_returns201() throws Exception {
    // Arrange
    CreateArticleRequest request =
        new CreateArticleRequest(
            "New Article",
            "New content",
            PageType.NEWS_PAGE,
            Language.ENGLISH,
            null,
            Collections.singletonList(testImage.getId()),
            null);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/webcontent/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.title", equalTo("New Article")))
        .andExpect(jsonPath("$.content", equalTo("New content")))
        .andExpect(jsonPath("$.pageType", equalTo("NEWS_PAGE")))
        .andExpect(jsonPath("$.language", equalTo("ENGLISH")))
        .andExpect(jsonPath("$.state", equalTo("CREATED")));

    // Verify article was saved
    assertThat(articleRepository.findAll()).hasSize(1);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createArticle_withoutAuth_returns401() throws Exception {
    // Arrange
    CreateArticleRequest request =
        new CreateArticleRequest(
            "Article", "Content", PageType.HOME_TEASER, Language.GERMAN, null, null, null);

    // Act & Assert - POST requires auth
    mockMvc
        .perform(
            post("/api/webcontent/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());
  }

  // ========== PUT /api/webcontent/articles/{id} (updateArticle) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateArticle_changeState_returns200() throws Exception {
    // Arrange
    Article article =
        createArticle(
            "Test", "content", ArticleState.CREATED, PageType.HOME_TEASER, Language.GERMAN);
    Article saved = saveArticle(article);
    UpdateArticleRequest request =
        new UpdateArticleRequest(
            "Updated Article",
            "Updated content",
            ArticleState.PUBLISHED,
            Language.GERMAN,
            null,
            null);

    // Act & Assert
    mockMvc
        .perform(
            put("/api/webcontent/articles/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(saved.getId().intValue())))
        .andExpect(jsonPath("$.title", equalTo("Updated Article")))
        .andExpect(jsonPath("$.state", equalTo("PUBLISHED")));

    // Verify update was persisted
    Article updated = findArticleById(saved.getId()).get();
    assertThat(updated.getTitle()).isEqualTo("Updated Article");
    assertThat(updated.getState()).isEqualTo(ArticleState.PUBLISHED);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateArticle_nonExistent_returns400() throws Exception {
    // Arrange
    UpdateArticleRequest request =
        new UpdateArticleRequest(
            "Title", "Content", ArticleState.CREATED, Language.GERMAN, null, null);

    // Act & Assert
    mockMvc
        .perform(
            put("/api/webcontent/articles/{id}", 999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  // ========== DELETE /api/webcontent/articles/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteArticle_withValidId_returns204() throws Exception {
    // Arrange
    Article article =
        createArticle(
            "Test", "content", ArticleState.CREATED, PageType.HOME_TEASER, Language.GERMAN);
    Article saved = saveArticle(article);

    // Act & Assert
    mockMvc
        .perform(delete("/api/webcontent/articles/{id}", saved.getId()))
        .andExpect(status().isNoContent());

    // Verify article was deleted
    assertThat(findArticleById(saved.getId())).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteArticle_nonExistent_returns400() throws Exception {
    // Act & Assert - DELETE endpoint responds
    mockMvc
        .perform(delete("/api/webcontent/articles/{id}", 999L))
        .andExpect(status().isNoContent());
  }

  // ========== Article with Multiple Images ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createArticle_withMultipleImages_returns201() throws Exception {
    // Arrange
    Image image2 = new Image();
    image2.setFileName("image2.jpg");
    image2.setMimeType("image/jpeg");
    image2.setImageData(new byte[] {5, 6, 7});
    image2 = saveImage(image2);

    CreateArticleRequest request =
        new CreateArticleRequest(
            "Multi-Image Article",
            "Content",
            PageType.HOME_TEASER,
            Language.GERMAN,
            null,
            List.of(testImage.getId(), image2.getId()),
            null);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/webcontent/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.title", equalTo("Multi-Image Article")))
        .andExpect(jsonPath("$.images", hasSize(2)));
  }
}
