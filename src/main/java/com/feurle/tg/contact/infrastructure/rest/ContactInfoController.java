// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import com.feurle.tg.contact.application.ContactInfoService;
import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.infrastructure.rest.dto.ContactInfoResponse;
import com.feurle.tg.contact.infrastructure.rest.dto.UpsertContactInfoRequest;
import com.feurle.tg.contact.infrastructure.rest.mapper.ContactInfoMapper;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
  public ResponseEntity<List<ContactInfoResponse>> getAllContactInfo() {
    log.info("getAllContactInfo: GET /api/contact/info");
    List<ContactInfoResponse> response =
        contactInfoService.getAllContactInfo().stream()
            .map(contactInfoMapper::toResponse)
            .toList();
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<ContactInfoResponse> getContactInfoById(@PathVariable Long id) {
    log.info("getContactInfoById: GET /api/contact/info/{}", id);
    return ResponseEntity.ok(contactInfoMapper.toResponse(contactInfoService.getContactInfoById(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ContactInfoResponse> createContactInfo(
      @Valid @RequestBody UpsertContactInfoRequest request) {
    log.info("createContactInfo: POST /api/contact/info");
    ContactInfo saved =
        contactInfoService.createContactInfo(
            request.name(),
            request.phone(),
            request.email(),
            request.street(),
            request.city(),
            request.zip(),
            request.primary(),
            contactInfoMapper.toDomain(request.officeHours()));
    return ResponseEntity.status(HttpStatus.CREATED).body(contactInfoMapper.toResponse(saved));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ContactInfoResponse> updateContactInfo(
      @PathVariable Long id, @Valid @RequestBody UpsertContactInfoRequest request) {
    log.info("updateContactInfo: PUT /api/contact/info/{}", id);
    ContactInfo saved =
        contactInfoService.updateContactInfo(
            id,
            request.name(),
            request.phone(),
            request.email(),
            request.street(),
            request.city(),
            request.zip(),
            request.primary(),
            contactInfoMapper.toDomain(request.officeHours()));
    return ResponseEntity.ok(contactInfoMapper.toResponse(saved));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteContactInfo(@PathVariable Long id) {
    log.info("deleteContactInfo: DELETE /api/contact/info/{}", id);
    contactInfoService.deleteContactInfo(id);
    return ResponseEntity.noContent().build();
  }
}
