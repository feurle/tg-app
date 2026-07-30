// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import com.feurle.tg.contact.application.ContactMessageService;
import com.feurle.tg.contact.infrastructure.rest.dto.RequestAppointmentRequest;
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

  private final ContactMessageService contactService;

  @PostMapping("/message")
  public ResponseEntity<Void> sendMessage(@Valid @RequestBody SendMessageRequest request) {
    log.info("sendMessage: GET /api/contact/message");
    contactService.sendMessage(
        request.title(), request.text(), request.replyToEmail(), request.senderName());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/appointment")
  public ResponseEntity<Void> requestAppointment(
      @Valid @RequestBody RequestAppointmentRequest request) {
    log.info("requestAppointment: POST /api/contact/appointment");
    contactService.requestAppointment(
        request.senderName(),
        request.replyToEmail(),
        request.phone(),
        request.preferredDate(),
        request.preferredTime(),
        request.text());
    return ResponseEntity.noContent().build();
  }
}
