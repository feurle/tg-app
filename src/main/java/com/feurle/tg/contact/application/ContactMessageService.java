// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactMessageService {

  @Value("${app.mail.from}")
  private String mailFrom;

  private final JavaMailSender mailSender;
  private final ContactInfoService contactInfoService;

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
  private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

  public void sendMessage(String title, String text, String replyToEmail, String senderName) {
    send(title, text + "\n\n" + senderName, replyToEmail);
    log.info("sendMessage: SEND SUCCESS");
  }

  public void requestAppointment(
      String senderName,
      String replyToEmail,
      String phone,
      LocalDate preferredDate,
      LocalTime preferredTime,
      String text) {
    String appointment = formatAppointment(preferredDate, preferredTime);
    send(
        "Terminwunsch: " + appointment,
        appointmentBody(appointment, senderName, replyToEmail, phone, text),
        replyToEmail);
    log.info("requestAppointment: SEND SUCCESS");
  }

  private String formatAppointment(LocalDate preferredDate, LocalTime preferredTime) {
    String formatted = DATE_FORMAT.format(preferredDate);
    return preferredTime == null
        ? formatted
        : formatted + " um " + TIME_FORMAT.format(preferredTime);
  }

  private String appointmentBody(
      String appointment, String senderName, String replyToEmail, String phone, String text) {
    StringBuilder body = new StringBuilder("Terminanfrage über die Website.\n\n");
    body.append("Wunschtermin: ").append(appointment).append('\n');
    body.append("Name: ").append(senderName).append('\n');
    body.append("E-Mail: ").append(replyToEmail);
    if (phone != null && !phone.isBlank()) {
      body.append("\nTelefon: ").append(phone.strip());
    }
    if (text != null && !text.isBlank()) {
      body.append("\n\nNachricht:\n").append(text.strip());
    }
    return body.toString();
  }

  private void send(String subject, String body, String replyToEmail) {
    String recipientEmail =
        contactInfoService
            .getContactInfo()
            .map(ci -> ci.getEmail())
            .filter(email -> email != null && !email.isBlank())
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "Keine Kontakt-E-Mail konfiguriert. Bitte ContactInfo über die Admin-Oberfläche pflegen."));

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(mailFrom);
    message.setTo(recipientEmail);
    message.setReplyTo(replyToEmail);
    message.setSubject(subject);
    message.setText(body);
    mailSender.send(message);
  }
}
