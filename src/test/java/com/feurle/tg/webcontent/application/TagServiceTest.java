// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.feurle.tg.webcontent.domain.Tag;
import com.feurle.tg.webcontent.domain.TagRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

  @Mock TagRepository tagRepository;

  @InjectMocks TagService tagService;

  // ========== getAllTags ==========

  @Test
  void getAllTags_returnsAllTags() {
    Tag tag1 = new Tag();
    tag1.setName("Spring");
    Tag tag2 = new Tag();
    tag2.setName("Java");
    when(tagRepository.findAll()).thenReturn(List.of(tag1, tag2));

    List<Tag> result = tagService.getAllTags();

    assertThat(result).hasSize(2);
    assertThat(result).extracting(Tag::getName).containsExactly("Spring", "Java");
    verify(tagRepository).findAll();
  }

  @Test
  void getAllTags_emptyRepository_returnsEmptyList() {
    when(tagRepository.findAll()).thenReturn(List.of());

    List<Tag> result = tagService.getAllTags();

    assertThat(result).isEmpty();
  }

  // ========== getTag ==========

  @Test
  void getTag_returnsTagWhenFound() {
    Tag tag = new Tag();
    tag.setName("Spring");
    when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));

    Tag result = tagService.getTag(1L);

    assertThat(result.getName()).isEqualTo("Spring");
  }

  @Test
  void getTag_throwsWhenNotFound() {
    when(tagRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> tagService.getTag(99L))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Tag not found: 99");
  }

  // ========== createTag ==========

  @Test
  void createTag_savesAndReturnsTag() {
    Tag saved = new Tag();
    saved.setName("Kotlin");
    when(tagRepository.save(any(Tag.class))).thenReturn(saved);

    Tag result = tagService.createTag("Kotlin");

    assertThat(result.getName()).isEqualTo("Kotlin");
    verify(tagRepository).save(any(Tag.class));
  }

  // ========== updateTag ==========

  @Test
  void updateTag_updatesNameAndSaves() {
    Tag existing = new Tag();
    existing.setName("OldName");
    when(tagRepository.findById(1L)).thenReturn(Optional.of(existing));
    when(tagRepository.save(existing)).thenReturn(existing);

    Tag result = tagService.updateTag(1L, "NewName");

    assertThat(result.getName()).isEqualTo("NewName");
    verify(tagRepository).save(existing);
  }

  @Test
  void updateTag_throwsWhenNotFound() {
    when(tagRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> tagService.updateTag(99L, "Name"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Tag not found: 99");
  }

  // ========== deleteTag ==========

  @Test
  void deleteTag_delegatesToRepository() {
    tagService.deleteTag(1L);

    verify(tagRepository).deleteById(1L);
  }
}
