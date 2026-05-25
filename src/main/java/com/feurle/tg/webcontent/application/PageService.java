// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.Page;
import com.feurle.tg.webcontent.domain.PageRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class PageService {

  private final PageRepository pageRepository;

  public List<Page> getAllPages() {
    return pageRepository.findAll();
  }

  public Page getPageBySlug(String slug) {
    return pageRepository
        .findBySlug(slug)
        .orElseThrow(() -> new NoSuchElementException("Page not found: " + slug));
  }

  public Page getPageById(Long id) {
    return pageRepository
        .findById(id)
        .orElseThrow(() -> new NoSuchElementException("Page not found: " + id));
  }

  public Page createPage(String slug, String title, String description) {
    Page page = new Page();
    page.setSlug(slug);
    page.setTitle(title);
    page.setDescription(description);
    return pageRepository.save(page);
  }

  public Page updatePage(Long id, String slug, String title, String description) {
    Page page = getPageById(id);
    page.setSlug(slug);
    page.setTitle(title);
    page.setDescription(description);
    return pageRepository.save(page);
  }

  public void deletePage(Long id) {
    pageRepository.deleteById(id);
  }
}
