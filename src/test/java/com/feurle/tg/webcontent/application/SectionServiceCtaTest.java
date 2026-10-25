// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.ImageRepository;
import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.domain.SectionRepository;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SectionServiceCtaTest {

  @Mock SectionRepository sectionRepository;
  @Mock ArticleRepository articleRepository;
  @Mock ImageRepository imageRepository;

  @InjectMocks SectionService sectionService;

  private Article cta;

  @BeforeEach
  void setUp() {
    cta = new Article();
    cta.setArticleType(ArticleType.CTA);
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "contact:appointment",
        "contact:message",
        "/questionnaire",
        "https://example.com/a?b=c",
        "http://example.com"
      })
  void createSection_acceptsAllowedTargets(String target) {
    when(articleRepository.findById(1L)).thenReturn(Optional.of(cta));
    when(sectionRepository.findByArticleIdOrderByOrderAscIdAsc(1L)).thenReturn(List.of());
    when(sectionRepository.save(any(Section.class))).thenAnswer(i -> i.getArgument(0));

    assertThatCode(() -> sectionService.createSection(1L, 1, "Label", target, null))
        .doesNotThrowAnyException();
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "javascript:alert(1)",
        "JavaScript:alert(1)",
        "data:text/html,x",
        "//evil.example",
        "contact:other",
        "mailto:a@b.c",
        "/with space",
        ""
      })
  void createSection_rejectsDisallowedTargets(String target) {
    when(articleRepository.findById(1L)).thenReturn(Optional.of(cta));

    assertThatThrownBy(() -> sectionService.createSection(1L, 1, "Label", target, null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void createSection_rejectsThirdButton() {
    when(articleRepository.findById(1L)).thenReturn(Optional.of(cta));
    when(sectionRepository.findByArticleIdOrderByOrderAscIdAsc(1L))
        .thenReturn(List.of(new Section(), new Section()));

    assertThatThrownBy(() -> sectionService.createSection(1L, 3, "Label", "/x", null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("at most 2");
  }

  @Test
  void updateSection_rejectsJavascriptTarget() {
    Section section = new Section();
    section.setArticle(cta);
    when(sectionRepository.findById(5L)).thenReturn(Optional.of(section));

    assertThatThrownBy(() -> sectionService.updateSection(5L, 1, "Label", "javascript:x", null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void createSection_doesNotValidateContentOfOtherTypes() {
    Article text = new Article();
    text.setArticleType(ArticleType.TEXT);
    when(articleRepository.findById(2L)).thenReturn(Optional.of(text));
    when(sectionRepository.save(any(Section.class))).thenAnswer(i -> i.getArgument(0));

    assertThatCode(() -> sectionService.createSection(2L, 1, "Title", "<p>free text</p>", null))
        .doesNotThrowAnyException();
    verify(sectionRepository).save(any(Section.class));
  }
}
