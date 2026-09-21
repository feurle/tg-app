// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.domain;

import java.util.List;
import java.util.Optional;

public interface VetInfoRepository {

  Optional<VetInfo> findFirst();

  Optional<VetInfo> findByPrimaryTrue();

  List<VetInfo> findAll();

  Optional<VetInfo> findById(Long id);

  VetInfo save(VetInfo vetInfo);

  void deleteById(Long id);

  void deleteAll();
}
