// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class ContactInfo {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  private String phone;

  private String email;

  private String street;

  private String city;

  private String zip;

  @Column(name = "is_primary")
  private boolean primary;

  @ElementCollection
  @CollectionTable(
      name = "contact_office_hour",
      joinColumns = @JoinColumn(name = "contact_info_id"))
  @OrderColumn(name = "sort_order")
  private List<OfficeHour> officeHours = new ArrayList<>();

  private LocalDateTime updatedAt;

  @PrePersist
  @PreUpdate
  void stamp() {
    updatedAt = LocalDateTime.now();
  }
}
