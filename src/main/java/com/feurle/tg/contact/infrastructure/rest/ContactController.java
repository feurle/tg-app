// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import com.feurle.tg.contact.application.ContactService;
import com.feurle.tg.contact.infrastructure.rest.dto.SendMessageRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

  private final ContactService contactService;

  @PostMapping("/message")
  public ResponseEntity<Void> sendMessage(@Valid @RequestBody SendMessageRequest request) {
    log.info("sendMessage: GET /api/contact/message");
    contactService.sendMessage(request.title(), request.text(), request.replyToEmail(), request.senderName());
    return ResponseEntity.noContent().build();
  }
}
