// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import com.feurle.tg.contact.domain.OfficeHour;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactInfoService {

  private final ContactInfoRepository contactInfoRepository;

  @Transactional(readOnly = true)
  public Optional<ContactInfo> getContactInfo() {
    return contactInfoRepository.findFirst();
  }

  @Transactional
  public ContactInfo upsertContactInfo(
      String name,
      String phone,
      String email,
      String street,
      String city,
      String zip,
      List<OfficeHour> officeHours) {
    ContactInfo contactInfo = contactInfoRepository.findFirst().orElseGet(ContactInfo::new);
    contactInfo.setName(name);
    contactInfo.setPhone(phone);
    contactInfo.setEmail(email);
    contactInfo.setStreet(street);
    contactInfo.setCity(city);
    contactInfo.setZip(zip);
    contactInfo.getOfficeHours().clear();
    contactInfo.getOfficeHours().addAll(officeHours);
    return contactInfoRepository.save(contactInfo);
  }
}
