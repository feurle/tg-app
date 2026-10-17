// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.infrastructure.rest;

import com.feurle.tg.contact.application.ContactMessageService;
import com.feurle.tg.contact.application.Referral;
import com.feurle.tg.contact.infrastructure.rest.dto.RequestAppointmentRequest;
import com.feurle.tg.contact.infrastructure.rest.dto.RequestReferralRequest;
import com.feurle.tg.contact.infrastructure.rest.dto.SendMessageRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
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
    if (StringUtils.hasText(request.website())) {
      return honeypotTripped();
    }
    contactService.sendMessage(
        request.title(), request.text(), request.replyToEmail(), request.senderName());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/appointment")
  public ResponseEntity<Void> requestAppointment(
      @Valid @RequestBody RequestAppointmentRequest request) {
    log.info("requestAppointment: POST /api/contact/appointment");
    if (StringUtils.hasText(request.website())) {
      return honeypotTripped();
    }
    contactService.requestAppointment(
        request.senderName(),
        request.replyToEmail(),
        request.phone(),
        request.preferredDate(),
        request.preferredTime(),
        request.text());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/referral")
  public ResponseEntity<Void> requestReferral(@Valid @RequestBody RequestReferralRequest request) {
    log.info("requestReferral: POST /api/contact/referral");
    if (StringUtils.hasText(request.website())) {
      return honeypotTripped();
    }
    contactService.requestReferral(
        new Referral(
            request.referringPractice(),
            request.referringVetName(),
            request.referringEmail(),
            request.referringPhone(),
            request.ownerName(),
            request.ownerContact(),
            request.patientName(),
            request.species(),
            request.breed(),
            request.age(),
            request.question(),
            request.previousTreatment(),
            request.urgency()));
    return ResponseEntity.noContent().build();
  }

  /** Bots fill every field. Pretend success so they get no hint, but send nothing. */
  private static ResponseEntity<Void> honeypotTripped() {
    log.warn("honeypot field filled, request ignored");
    return ResponseEntity.noContent().build();
  }
}
