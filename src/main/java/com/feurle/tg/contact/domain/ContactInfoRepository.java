// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.domain;

import java.util.List;
import java.util.Optional;

public interface ContactInfoRepository {

  Optional<ContactInfo> findFirst();

  List<ContactInfo> findAll();

  ContactInfo save(ContactInfo contactInfo);

  void deleteAll();
}
