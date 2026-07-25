// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import com.feurle.tg.contact.domain.OfficeHour;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactInfoService {

  private final ContactInfoRepository contactInfoRepository;

  @Transactional(readOnly = true)
  public List<ContactInfo> getAllContactInfo() {
    return contactInfoRepository.findAll();
  }

  /** Returns the primary ContactInfo — used for mail dispatch. */
  @Transactional(readOnly = true)
  public Optional<ContactInfo> getContactInfo() {
    return contactInfoRepository.findByPrimaryTrue();
  }

  @Transactional(readOnly = true)
  public ContactInfo getContactInfoById(Long id) {
    return contactInfoRepository
        .findById(id)
        .orElseThrow(() -> new NoSuchElementException("ContactInfo not found: " + id));
  }

  @Transactional
  public ContactInfo createContactInfo(
      String name,
      String phone,
      String email,
      String street,
      String city,
      String zip,
      boolean primary,
      List<OfficeHour> officeHours) {
    if (primary) {
      clearPrimaryFlag();
    }
    ContactInfo contactInfo = new ContactInfo();
    contactInfo.setName(name);
    contactInfo.setPhone(phone);
    contactInfo.setEmail(email);
    contactInfo.setStreet(street);
    contactInfo.setCity(city);
    contactInfo.setZip(zip);
    contactInfo.setPrimary(primary);
    contactInfo.getOfficeHours().addAll(officeHours);
    return contactInfoRepository.save(contactInfo);
  }

  @Transactional
  public ContactInfo updateContactInfo(
      Long id,
      String name,
      String phone,
      String email,
      String street,
      String city,
      String zip,
      boolean primary,
      List<OfficeHour> officeHours) {
    ContactInfo contactInfo =
        contactInfoRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("ContactInfo not found: " + id));
    if (primary && !contactInfo.isPrimary()) {
      clearPrimaryFlag();
    }
    contactInfo.setName(name);
    contactInfo.setPhone(phone);
    contactInfo.setEmail(email);
    contactInfo.setStreet(street);
    contactInfo.setCity(city);
    contactInfo.setZip(zip);
    contactInfo.setPrimary(primary);
    contactInfo.getOfficeHours().clear();
    contactInfo.getOfficeHours().addAll(officeHours);
    return contactInfoRepository.save(contactInfo);
  }

  @Transactional
  public void deleteContactInfo(Long id) {
    if (contactInfoRepository.findById(id).isEmpty()) {
      throw new NoSuchElementException("ContactInfo not found: " + id);
    }
    contactInfoRepository.deleteById(id);
  }

  private void clearPrimaryFlag() {
    contactInfoRepository
        .findByPrimaryTrue()
        .ifPresent(
            existing -> {
              existing.setPrimary(false);
              contactInfoRepository.save(existing);
            });
  }
}
