// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.Page;
import com.feurle.tg.webcontent.domain.PageRepository;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.MoveDirection;
import com.feurle.tg.webcontent.infrastructure.rest.dto.CreateArticleRequest;
import com.feurle.tg.webcontent.infrastructure.rest.dto.MoveArticleRequest;
import com.feurle.tg.webcontent.infrastructure.rest.dto.UpdateArticleRequest;
import java.util.ArrayList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

/** Covers the article {@code order} field: sorting, auto-append on create, and up/down moves. */
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class ArticleOrderingIT {

  private static final String SLUG = "ordering-test";

  @Autowired private WebApplicationContext webApplicationContext;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private ArticleRepository articleRepository;
  @Autowired private PageRepository pageRepository;

  private MockMvc mockMvc;
  private Page page;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    articleRepository.findAll().forEach(a -> articleRepository.deleteById(a.getId()));
    // ddl-auto=create-drop wipes the Liquibase-seeded pages, so provide our own.
    page = pageRepository.findBySlug(SLUG).orElseGet(this::createPage);
  }

  private Page createPage() {
    Page newPage = new Page();
    newPage.setSlug(SLUG);
    newPage.setTitle("Ordering test page");
    newPage.setDescription("Fixture for article ordering");
    return pageRepository.save(newPage);
  }

  @Test
  void publishedArticlesAreReturnedInOrder() throws Exception {
    // Persisted deliberately out of order.
    saveArticle("Third", 3, Language.GERMAN);
    saveArticle("First", 1, Language.GERMAN);
    saveArticle("Second", 2, Language.GERMAN);

    mockMvc
        .perform(
            get("/api/webcontent/articles/page/{slug}/published", SLUG)
                .param("language", "GERMAN")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("First", "Second", "Third")));
  }

  @Test
  void articlesSharingAnOrderValueFallBackToIdOrder() throws Exception {
    Article first = saveArticle("Tie A", 1, Language.GERMAN);
    Article second = saveArticle("Tie B", 1, Language.GERMAN);
    assertThat(first.getId()).isLessThan(second.getId());

    mockMvc
        .perform(
            get("/api/webcontent/articles/page/{slug}/published", SLUG)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("Tie A", "Tie B")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createWithoutOrderAppendsToEndOfPageAndLanguage() throws Exception {
    saveArticle("Existing", 4, Language.GERMAN);
    // Another language must not influence the German sequence.
    saveArticle("English", 9, Language.ENGLISH);

    mockMvc
        .perform(
            post("/api/webcontent/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest(null))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.order", equalTo(5)));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createWithExplicitOrderKeepsIt() throws Exception {
    saveArticle("Existing", 4, Language.GERMAN);

    mockMvc
        .perform(
            post("/api/webcontent/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest(2))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.order", equalTo(2)));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createInEmptyScopeStartsAtOne() throws Exception {
    mockMvc
        .perform(
            post("/api/webcontent/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest(null))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.order", equalTo(1)));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateWithOrderChangesItAndWithoutOrderKeepsIt() throws Exception {
    Article article = saveArticle("Movable", 3, Language.GERMAN);

    mockMvc
        .perform(
            put("/api/webcontent/articles/{id}", article.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest(1))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.order", equalTo(1)));

    mockMvc
        .perform(
            put("/api/webcontent/articles/{id}", article.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest(null))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.order", equalTo(1)));

    assertThat(articleRepository.findById(article.getId()).orElseThrow().getOrder()).isEqualTo(1);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveDownSwapsWithTheFollowingArticle() throws Exception {
    Article first = saveArticle("First", 1, Language.GERMAN);
    saveArticle("Second", 2, Language.GERMAN);
    saveArticle("Third", 3, Language.GERMAN);

    move(first, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("Second", "First", "Third")))
        .andExpect(jsonPath("$[*].order", contains(1, 2, 3)));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveUpSwapsWithThePrecedingArticle() throws Exception {
    saveArticle("First", 1, Language.GERMAN);
    Article third = saveArticle("Third", 3, Language.GERMAN);
    saveArticle("Second", 2, Language.GERMAN);

    move(third, MoveDirection.UP)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("First", "Third", "Second")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveAtTheBoundaryIsANoOp() throws Exception {
    Article first = saveArticle("First", 1, Language.GERMAN);
    Article second = saveArticle("Second", 2, Language.GERMAN);

    move(first, MoveDirection.UP)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("First", "Second")));

    move(second, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("First", "Second")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveOnlyAffectsTheSameLanguage() throws Exception {
    Article german = saveArticle("DE 1", 1, Language.GERMAN);
    saveArticle("DE 2", 2, Language.GERMAN);
    Article english = saveArticle("EN 1", 1, Language.ENGLISH);

    move(german, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("DE 2", "DE 1")));

    assertThat(articleRepository.findById(english.getId()).orElseThrow().getOrder()).isEqualTo(1);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveNormalisesDuplicateAndZeroOrders() throws Exception {
    // Mirrors the seeded state of page "about" plus articles created before order was writable.
    Article a = saveArticle("A", 1, Language.GERMAN);
    saveArticle("B", 1, Language.GERMAN);
    saveArticle("C", 0, Language.GERMAN);

    // "C" sorts first (order 0), so moving "A" down swaps it with "B".
    move(a, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("C", "B", "A")))
        .andExpect(jsonPath("$[*].order", contains(1, 2, 3)));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createRejectsOrderBelowOne() throws Exception {
    for (int invalid : new int[] {0, -5}) {
      mockMvc
          .perform(
              post("/api/webcontent/articles")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(createRequest(invalid))))
          .andExpect(status().isBadRequest());
    }
    assertThat(articleRepository.findAll()).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateRejectsOrderBelowOne() throws Exception {
    Article article = saveArticle("Keeps its order", 2, Language.GERMAN);

    mockMvc
        .perform(
            put("/api/webcontent/articles/{id}", article.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest(0))))
        .andExpect(status().isBadRequest());

    assertThat(articleRepository.findById(article.getId()).orElseThrow().getOrder()).isEqualTo(2);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveNonExistentArticleReturns400() throws Exception {
    mockMvc
        .perform(
            put("/api/webcontent/articles/{id}/move", 999_999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MoveArticleRequest(MoveDirection.UP))))
        .andExpect(status().isBadRequest());
  }

  private org.springframework.test.web.servlet.ResultActions move(
      Article article, MoveDirection direction) throws Exception {
    return mockMvc.perform(
        put("/api/webcontent/articles/{id}/move", article.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new MoveArticleRequest(direction))));
  }

  private CreateArticleRequest createRequest(Integer order) {
    return new CreateArticleRequest(
        "New", "content", ArticleType.TEXT, Language.GERMAN, page.getId(), order, null, null);
  }

  private UpdateArticleRequest updateRequest(Integer order) {
    return new UpdateArticleRequest(
        "Movable", "content", ArticleState.PUBLISHED, Language.GERMAN, order, null, null);
  }

  private Article saveArticle(String title, int order, Language language) {
    Article article = new Article();
    article.setTitle(title);
    article.setContent("content");
    article.setState(ArticleState.PUBLISHED);
    article.setArticleType(ArticleType.TEXT);
    article.setLanguage(language);
    article.setOrder(order);
    article.setPage(page);
    article.setImages(new ArrayList<>());
    return articleRepository.save(article);
  }
}
