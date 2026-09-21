// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.persistence;

import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.domain.VetInfoRepository;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaVetInfoRepository extends JpaRepository<VetInfo, Long>, VetInfoRepository {

  @Override
  default Optional<VetInfo> findFirst() {
    return findAll(Pageable.ofSize(1)).stream().findFirst();
  }
}
