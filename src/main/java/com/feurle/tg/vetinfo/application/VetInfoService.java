// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.application;

import com.feurle.tg.vetinfo.PrimaryContactEmailLookup;
import com.feurle.tg.vetinfo.domain.OfficeHour;
import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.domain.VetInfoRepository;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VetInfoService implements PrimaryContactEmailLookup {

  private final VetInfoRepository vetInfoRepository;

  @Transactional(readOnly = true)
  public List<VetInfo> getAllVetInfo() {
    return vetInfoRepository.findAll();
  }

  /** Returns the primary VetInfo — used for mail dispatch. */
  @Transactional(readOnly = true)
  public Optional<VetInfo> getVetInfo() {
    return vetInfoRepository.findByPrimaryTrue();
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<String> primaryEmail() {
    return getVetInfo().map(VetInfo::getEmail).filter(email -> email != null && !email.isBlank());
  }

  @Transactional(readOnly = true)
  public VetInfo getVetInfoById(Long id) {
    return vetInfoRepository
        .findById(id)
        .orElseThrow(() -> new NoSuchElementException("VetInfo not found: " + id));
  }

  @Transactional
  public VetInfo createVetInfo(
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
    VetInfo vetInfo = new VetInfo();
    vetInfo.setName(name);
    vetInfo.setPhone(phone);
    vetInfo.setEmail(email);
    vetInfo.setStreet(street);
    vetInfo.setCity(city);
    vetInfo.setZip(zip);
    vetInfo.setPrimary(primary);
    vetInfo.getOfficeHours().addAll(officeHours);
    return vetInfoRepository.save(vetInfo);
  }

  @Transactional
  public VetInfo updateVetInfo(
      Long id,
      String name,
      String phone,
      String email,
      String street,
      String city,
      String zip,
      boolean primary,
      List<OfficeHour> officeHours) {
    VetInfo vetInfo =
        vetInfoRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("VetInfo not found: " + id));
    if (primary && !vetInfo.isPrimary()) {
      clearPrimaryFlag();
    }
    vetInfo.setName(name);
    vetInfo.setPhone(phone);
    vetInfo.setEmail(email);
    vetInfo.setStreet(street);
    vetInfo.setCity(city);
    vetInfo.setZip(zip);
    vetInfo.setPrimary(primary);
    vetInfo.getOfficeHours().clear();
    vetInfo.getOfficeHours().addAll(officeHours);
    return vetInfoRepository.save(vetInfo);
  }

  @Transactional
  public void deleteVetInfo(Long id) {
    if (vetInfoRepository.findById(id).isEmpty()) {
      throw new NoSuchElementException("VetInfo not found: " + id);
    }
    vetInfoRepository.deleteById(id);
  }

  private void clearPrimaryFlag() {
    vetInfoRepository
        .findByPrimaryTrue()
        .ifPresent(
            existing -> {
              existing.setPrimary(false);
              vetInfoRepository.save(existing);
            });
  }
}
