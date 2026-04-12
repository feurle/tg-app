// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.domain;

import java.util.Optional;

public interface ContactInfoRepository {

  Optional<ContactInfo> findFirst();

  ContactInfo save(ContactInfo contactInfo);
}
