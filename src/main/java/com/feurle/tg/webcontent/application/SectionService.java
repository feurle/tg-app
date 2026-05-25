// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.domain.SectionRepository;
import jakarta.transaction.Transactional;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class SectionService {

  private final SectionRepository sectionRepository;
  private final ArticleRepository articleRepository;

  public Section createSection(Long articleId, int order, String title, String content) {
    Article article =
        articleRepository
            .findById(articleId)
            .orElseThrow(() -> new NoSuchElementException("Article not found: " + articleId));
    Section section = new Section();
    section.setOrder(order);
    section.setTitle(title);
    section.setContent(content);
    section.setArticle(article);
    return sectionRepository.save(section);
  }

  public Section updateSection(Long id, int order, String title, String content) {
    Section section =
        sectionRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("Section not found: " + id));
    section.setOrder(order);
    section.setTitle(title);
    section.setContent(content);
    return sectionRepository.save(section);
  }

  public void deleteSection(Long id) {
    sectionRepository.deleteById(id);
  }
}
