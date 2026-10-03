// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.domain.SectionRepository;
import com.feurle.tg.webcontent.domain.enumeration.MoveDirection;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
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

  /**
   * Swaps a section with its neighbour inside its article and returns all sections of the article
   * in their new order. Moving past either end is a no-op.
   */
  public List<Section> moveSection(Long id, MoveDirection direction) {
    Section section =
        sectionRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Section not found: " + id));

    List<Section> scope = normalizeScope(section.getArticle().getId());
    int index = indexOf(scope, id);
    int target = direction == MoveDirection.UP ? index - 1 : index + 1;
    if (target < 0 || target >= scope.size()) {
      return scope;
    }

    Section current = scope.get(index);
    Section neighbour = scope.get(target);
    int currentOrder = current.getOrder();
    current.setOrder(neighbour.getOrder());
    neighbour.setOrder(currentOrder);
    sectionRepository.save(current);
    sectionRepository.save(neighbour);

    scope.set(index, neighbour);
    scope.set(target, current);
    return scope;
  }

  /** Renumbers an article's sections to a gapless 1..N sequence (seed data has duplicates). */
  private List<Section> normalizeScope(Long articleId) {
    List<Section> scope =
        new ArrayList<>(sectionRepository.findByArticleIdOrderByOrderAscIdAsc(articleId));
    for (int i = 0; i < scope.size(); i++) {
      Section section = scope.get(i);
      if (section.getOrder() != i + 1) {
        section.setOrder(i + 1);
        sectionRepository.save(section);
      }
    }
    return scope;
  }

  private static int indexOf(List<Section> scope, Long id) {
    for (int i = 0; i < scope.size(); i++) {
      if (scope.get(i).getId().equals(id)) {
        return i;
      }
    }
    throw new IllegalStateException("Section " + id + " is missing from its own ordering scope");
  }

  public void deleteSection(Long id) {
    sectionRepository.deleteById(id);
  }
}
