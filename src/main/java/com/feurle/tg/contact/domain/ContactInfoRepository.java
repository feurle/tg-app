// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.domain;

import java.util.List;
import java.util.Optional;

public interface ContactInfoRepository {

  Optional<ContactInfo> findFirst();

  Optional<ContactInfo> findByPrimaryTrue();

  List<ContactInfo> findAll();

  Optional<ContactInfo> findById(Long id);

  ContactInfo save(ContactInfo contactInfo);

  void deleteById(Long id);

  void deleteAll();
}
