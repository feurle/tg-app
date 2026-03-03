// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Article {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;

  @Lob
  @Column(columnDefinition = "CLOB")
  private String content;

  @Enumerated(EnumType.STRING)
  private ArticleState state;

  @Enumerated(EnumType.STRING)
  private PageType page;

  @Enumerated(EnumType.STRING)
  private Language language = Language.GERMAN;

  private LocalDateTime publishedDate;

  @ManyToMany(cascade = CascadeType.PERSIST)
  @JoinTable(
      name = "article_images",
      joinColumns = @JoinColumn(name = "article_id"),
      inverseJoinColumns = @JoinColumn(name = "image_id"))
  private List<Image> images = new ArrayList<>();

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;

  @PrePersist
  void prePersist() {
    createdAt = updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
