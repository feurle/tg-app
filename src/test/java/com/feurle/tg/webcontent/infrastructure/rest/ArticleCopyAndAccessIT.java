// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.Page;
import com.feurle.tg.webcontent.domain.PageRepository;
import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.domain.SectionRepository;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.MoveDirection;
import com.feurle.tg.webcontent.infrastructure.rest.dto.MoveArticleRequest;
import java.time.LocalDateTime;
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

/** Covers copying an article into another language and that writing is reserved for admins. */
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class ArticleCopyAndAccessIT {

  private static final String SLUG = "copy-test";

  @Autowired private WebApplicationContext webApplicationContext;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private ArticleRepository articleRepository;
  @Autowired private SectionRepository sectionRepository;
  @Autowired private PageRepository pageRepository;

  private MockMvc mockMvc;
  private Page page;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
    articleRepository.findAll().forEach(a -> articleRepository.deleteById(a.getId()));
    page =
        pageRepository
            .findBySlug(SLUG)
            .orElseGet(
                () -> {
                  Page p = new Page();
                  p.setSlug(SLUG);
                  p.setTitle("Copy test");
                  p.setDescription("Fixture");
                  return pageRepository.save(p);
                });
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void copyCreatesDraftInTargetLanguageWithSectionsAtTheEnd() throws Exception {
    Article source = saveArticle("Quelle", 1, Language.GERMAN, ArticleState.PUBLISHED);
    saveSection(source, "Eins", 1);
    saveSection(source, "Zwei", 2);
    saveArticle("Existing EN", 4, Language.ENGLISH, ArticleState.PUBLISHED);

    mockMvc
        .perform(
            post("/api/webcontent/articles/{id}/copy", source.getId()).param("language", "ENGLISH"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.title", equalTo("Quelle")))
        .andExpect(jsonPath("$.language", equalTo("ENGLISH")))
        .andExpect(jsonPath("$.state", equalTo("CREATED")))
        .andExpect(jsonPath("$.order", equalTo(5)))
        .andExpect(jsonPath("$.articleType", equalTo("TEXT")))
        .andExpect(jsonPath("$.sections.length()", equalTo(2)))
        .andExpect(jsonPath("$.sections[0].title", equalTo("Eins")));

    // The original is untouched and still owns its sections.
    assertThat(articleRepository.findById(source.getId()).orElseThrow().getState())
        .isEqualTo(ArticleState.PUBLISHED);
    assertThat(sectionRepository.findByArticleIdOrderByOrderAscIdAsc(source.getId())).hasSize(2);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void copyOfUnknownArticleReturns400() throws Exception {
    mockMvc
        .perform(post("/api/webcontent/articles/{id}/copy", 999_999L).param("language", "ENGLISH"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @WithMockUser(roles = "USER")
  void plainUserCannotWrite() throws Exception {
    Article article = saveArticle("A", 1, Language.GERMAN, ArticleState.PUBLISHED);
    Section section = saveSection(article, "S", 1);
    String move = objectMapper.writeValueAsString(new MoveArticleRequest(MoveDirection.DOWN));

    mockMvc
        .perform(
            post("/api/webcontent/articles/{id}/copy", article.getId())
                .param("language", "ENGLISH"))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            put("/api/webcontent/articles/{id}/move", article.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(move))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            put("/api/webcontent/sections/{id}/move", section.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(move))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(delete("/api/webcontent/articles/{id}", article.getId()))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(
            post("/api/webcontent/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"x\"}"))
        .andExpect(status().isForbidden());
    mockMvc.perform(delete("/api/webcontent/images/{id}", 1L)).andExpect(status().isForbidden());

    assertThat(articleRepository.findById(article.getId())).isPresent();
  }

  private Article saveArticle(String title, int order, Language language, ArticleState state) {
    Article a = new Article();
    a.setTitle(title);
    a.setContent("content");
    a.setState(state);
    a.setPublishedDate(state == ArticleState.PUBLISHED ? LocalDateTime.now() : null);
    a.setArticleType(ArticleType.TEXT);
    a.setLanguage(language);
    a.setOrder(order);
    a.setPage(page);
    return articleRepository.save(a);
  }

  private Section saveSection(Article owner, String title, int order) {
    Section s = new Section();
    s.setTitle(title);
    s.setContent("c");
    s.setOrder(order);
    s.setArticle(owner);
    return sectionRepository.save(s);
  }
}
