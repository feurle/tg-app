// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.domain;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.ArticleType;
import com.feurle.tg.webcontent.domain.enumeration.Language;
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

  @Column(name = "sort_order")
  private int order;

  @Enumerated(EnumType.STRING)
  private ArticleState state;

  @Enumerated(EnumType.STRING)
  @Column(name = "article_type")
  private ArticleType articleType;

  @Enumerated(EnumType.STRING)
  private Language language = Language.GERMAN;

  private LocalDateTime publishedDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "page_id")
  private Page page;

  @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("order ASC")
  private List<Section> sections = new ArrayList<>();

  @ManyToMany(cascade = CascadeType.PERSIST)
  @JoinTable(
      name = "article_images",
      joinColumns = @JoinColumn(name = "article_id"),
      inverseJoinColumns = @JoinColumn(name = "image_id"))
  private List<Image> images = new ArrayList<>();

  @ManyToMany(cascade = CascadeType.PERSIST)
  @JoinTable(
      name = "article_tags",
      joinColumns = @JoinColumn(name = "article_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  private List<Tag> tags = new ArrayList<>();

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
