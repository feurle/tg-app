// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.domain.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "app_user")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String login;

  @Column(nullable = false)
  private String password;

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private Boolean activated = false;

  @Column(name = "lang_key")
  private String langKey = "de";

  @Column(name = "image_url")
  private String imageUrl;

  @Column(name = "activation_key")
  private String activationKey;

  @Column(name = "reset_key")
  private String resetKey;

  @Column(name = "reset_date")
  private Instant resetDate;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "user_authority",
      joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "authority_name", referencedColumnName = "name"))
  private Set<Authority> authorities = new HashSet<>();

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private Instant createdDate;

  @CreatedBy
  @Column(name = "created_by", nullable = false, updatable = false)
  private String createdBy;

  @LastModifiedDate
  @Column(nullable = false)
  private Instant lastModifiedDate;

  @LastModifiedBy
  @Column(name = "last_modified_by")
  private String lastModifiedBy;
}
