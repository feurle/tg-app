// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.Tag;
import com.feurle.tg.webcontent.domain.TagRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class TagService {

  private final TagRepository tagRepository;

  public List<Tag> getAllTags() {
    return tagRepository.findAll();
  }

  public Tag getTag(Long id) {
    return tagRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id));
  }

  public Tag createTag(String name) {
    Tag tag = new Tag();
    tag.setName(name);
    return tagRepository.save(tag);
  }

  public Tag updateTag(Long id, String name) {
    Tag tag =
        tagRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id));
    tag.setName(name);
    return tagRepository.save(tag);
  }

  public void deleteTag(Long id) {
    tagRepository.deleteById(id);
  }
}
