// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.domain.SectionRepository;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.MoveDirection;
import com.feurle.tg.webcontent.infrastructure.rest.dto.MoveArticleRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

/** Covers up/down moves of sections inside their article. */
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class SectionOrderingIT {

  @Autowired private WebApplicationContext webApplicationContext;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private ArticleRepository articleRepository;
  @Autowired private SectionRepository sectionRepository;

  private MockMvc mockMvc;
  private Article article;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    articleRepository.findAll().forEach(a -> articleRepository.deleteById(a.getId()));
    article = saveArticle("Host");
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveDownSwapsWithTheFollowingSection() throws Exception {
    Section first = saveSection(article, "First", 1);
    saveSection(article, "Second", 2);
    saveSection(article, "Third", 3);

    move(first, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("Second", "First", "Third")))
        .andExpect(jsonPath("$[*].order", contains(1, 2, 3)));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveUpSwapsWithThePrecedingSection() throws Exception {
    saveSection(article, "First", 1);
    saveSection(article, "Second", 2);
    Section third = saveSection(article, "Third", 3);

    move(third, MoveDirection.UP)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("First", "Third", "Second")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveAtTheBoundaryIsANoOp() throws Exception {
    Section first = saveSection(article, "First", 1);
    Section second = saveSection(article, "Second", 2);

    move(first, MoveDirection.UP)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("First", "Second")));
    move(second, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("First", "Second")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveOnlyAffectsTheSameArticle() throws Exception {
    Section mine = saveSection(article, "Mine 1", 1);
    saveSection(article, "Mine 2", 2);
    Section other = saveSection(saveArticle("Other"), "Other 1", 1);

    move(mine, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("Mine 2", "Mine 1")));

    assertThat(sectionRepository.findById(other.getId()).orElseThrow().getOrder()).isEqualTo(1);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveNormalisesDuplicateAndZeroOrders() throws Exception {
    Section a = saveSection(article, "A", 1);
    saveSection(article, "B", 1);
    saveSection(article, "C", 0);

    // "C" sorts first (order 0), so moving "A" down swaps it with "B".
    move(a, MoveDirection.DOWN)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].title", contains("C", "B", "A")))
        .andExpect(jsonPath("$[*].order", contains(1, 2, 3)));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void moveNonExistentSectionReturns400() throws Exception {
    mockMvc
        .perform(
            put("/api/webcontent/sections/{id}/move", 999_999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MoveArticleRequest(MoveDirection.UP))))
        .andExpect(status().isBadRequest());
  }

  private ResultActions move(Section section, MoveDirection direction) throws Exception {
    return mockMvc.perform(
        put("/api/webcontent/sections/{id}/move", section.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new MoveArticleRequest(direction))));
  }

  private Article saveArticle(String title) {
    Article a = new Article();
    a.setTitle(title);
    a.setContent("content");
    a.setState(ArticleState.PUBLISHED);
    a.setArticleType(ArticleType.TEXT);
    a.setLanguage(Language.GERMAN);
    a.setOrder(1);
    return articleRepository.save(a);
  }

  private Section saveSection(Article owner, String title, int order) {
    Section s = new Section();
    s.setTitle(title);
    s.setContent("content");
    s.setOrder(order);
    s.setArticle(owner);
    return sectionRepository.save(s);
  }
}
