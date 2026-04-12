// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.persistence;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaContactInfoRepository
    extends JpaRepository<ContactInfo, Long>, ContactInfoRepository {

  @Override
  default Optional<ContactInfo> findFirst() {
    return findAll(Pageable.ofSize(1)).stream().findFirst();
  }
}
