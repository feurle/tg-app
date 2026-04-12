// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import com.feurle.tg.contact.application.ContactInfoService;
import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.infrastructure.rest.dto.ContactInfoResponse;
import com.feurle.tg.contact.infrastructure.rest.dto.UpsertContactInfoRequest;
import com.feurle.tg.contact.infrastructure.rest.mapper.ContactInfoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/contact/info")
@RequiredArgsConstructor
public class ContactInfoController {

  private final ContactInfoService contactInfoService;
  private final ContactInfoMapper contactInfoMapper;

  @GetMapping
  public ResponseEntity<ContactInfoResponse> getContactInfo() {
    log.info("getContactInfo: GET /api/contact/info");
    return contactInfoService
        .getContactInfo()
        .map(contactInfoMapper::toResponse)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.noContent().build());
  }

  @PutMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ContactInfoResponse> upsertContactInfo(
      @Valid @RequestBody UpsertContactInfoRequest request) {
    log.info("upsertContactInfo: PUT /api/contact/info");
    ContactInfo saved =
        contactInfoService.upsertContactInfo(
            request.phone(),
            request.email(),
            request.street(),
            request.city(),
            request.zip(),
            contactInfoMapper.toDomain(request.officeHours()));
    return ResponseEntity.ok(contactInfoMapper.toResponse(saved));
  }
}
