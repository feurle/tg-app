// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import java.util.ArrayList;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

/** The public page endpoint must never expose drafts; the page list is for logged-in users only. */
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class PageControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;
  @Autowired private ArticleRepository articleRepository;
  @Autowired private PageRepository pageRepository;

  private MockMvc mockMvc;
  private Page page;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
    clean();
    page = new Page();
    page.setSlug("test-page");
    page.setTitle("Test page");
    page.setDescription("Fixture");
    page = pageRepository.save(page);
    saveArticle("Published", 1, ArticleState.PUBLISHED);
    saveArticle("Draft", 2, ArticleState.CREATED);
    saveArticle("Closed", 3, ArticleState.CLOSED);
  }

  @AfterEach
  void tearDown() {
    clean();
  }

  private void clean() {
    articleRepository.findAll().forEach(a -> articleRepository.deleteById(a.getId()));
    pageRepository.findAll().forEach(p -> pageRepository.deleteById(p.getId()));
  }

  private void saveArticle(String title, int order, ArticleState state) {
    Article article = new Article();
    article.setTitle(title);
    article.setContent("content");
    article.setState(state);
    article.setArticleType(ArticleType.TEXT);
    article.setLanguage(Language.GERMAN);
    article.setOrder(order);
    article.setPage(page);
    article.setImages(new ArrayList<>());
    articleRepository.save(article);
  }

  @Test
  void getPageBySlug_returnsOnlyPublishedArticles_whenAnonymous() throws Exception {
    mockMvc
        .perform(get("/api/webcontent/pages/test-page"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.articles", hasSize(1)))
        .andExpect(jsonPath("$.articles[0].title").value("Published"));
  }

  @Test
  @WithMockUser
  void getPageBySlug_returnsAllArticles_whenLoggedIn() throws Exception {
    mockMvc
        .perform(get("/api/webcontent/pages/test-page"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.articles[*].title", contains("Published", "Draft", "Closed")));
  }

  @Test
  void getAllPages_isNotPublic() throws Exception {
    // 403 without login; only the dev profile has HTTP Basic enabled, which would give 401
    mockMvc.perform(get("/api/webcontent/pages")).andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser
  void getAllPages_returnsSummariesWithoutArticles_whenLoggedIn() throws Exception {
    mockMvc
        .perform(get("/api/webcontent/pages"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].slug").value("test-page"))
        .andExpect(jsonPath("$[0].title").value("Test page"))
        .andExpect(jsonPath("$[0].articles").doesNotExist());
  }
}
