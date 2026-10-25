// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest;

import static org.assertj.core.api.Assertions.assertThat;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

/** Every page that used to hard-code the contact buttons has a published CTA in the seed. */
@SpringBootTest
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:seeded-cta")
@Transactional
class SeededCtaIT {

  @Autowired private ArticleRepository articleRepository;

  @ParameterizedTest
  @ValueSource(strings = {"home", "news", "about", "treatments", "contact"})
  void pageHasPublishedGermanCtaWithContactButtons(String slug) {
    assertThat(lastPublishedGermanCta(slug).getSections())
        .extracting(s -> s.getContent())
        .containsExactly("contact:appointment", "contact:message");
  }

  @Test
  void forVetsCtaOffersReferralInsteadOfAppointment() {
    assertThat(lastPublishedGermanCta("for-vets").getSections())
        .extracting(s -> s.getContent())
        .containsExactly("contact:referral", "contact:message");
  }

  private Article lastPublishedGermanCta(String slug) {
    List<Article> ctas =
        articleRepository.findByPage_SlugOrderByOrderAscIdAsc(slug).stream()
            .filter(a -> a.getArticleType() == ArticleType.CTA)
            .filter(a -> a.getState() == ArticleState.PUBLISHED)
            .filter(a -> a.getLanguage() == Language.GERMAN)
            .toList();

    assertThat(ctas).isNotEmpty();
    return ctas.getLast();
  }

  @Test
  void treatmentsHasQuestionnaireCtaBeforeContactCta() {
    List<Article> ctas =
        articleRepository.findByPage_SlugOrderByOrderAscIdAsc("treatments").stream()
            .filter(a -> a.getArticleType() == ArticleType.CTA)
            .toList();

    assertThat(ctas).hasSize(2);
    assertThat(ctas.getFirst().getSections())
        .extracting(s -> s.getContent())
        .containsExactly("/questionnaire");
  }
}
