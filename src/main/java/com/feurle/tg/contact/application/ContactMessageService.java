// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import com.feurle.tg.notification.MailService;
import com.feurle.tg.vetinfo.PrimaryContactEmailLookup;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactMessageService {

  private final MailService mailService;
  private final PrimaryContactEmailLookup primaryContactEmailLookup;
  private final AppointmentRules appointmentRules;

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
    appointmentRules.requireBookable(preferredDate, preferredTime);
    String appointment = formatAppointment(preferredDate, preferredTime);
    send(
        "Terminwunsch: " + appointment,
        appointmentBody(appointment, senderName, replyToEmail, phone, text),
        replyToEmail);
    log.info("requestAppointment: SEND SUCCESS");
  }

  /**
   * Mails the referral to the practice and a confirmation to the referring vet. The practice mail
   * is what counts: if it fails the request fails, a failing confirmation is only logged.
   */
  public void requestReferral(Referral referral) {
    String practiceEmail = practiceEmail();
    mailService.send(
        practiceEmail,
        referralSubject(referral),
        referralBody(referral),
        referral.referringEmail());
    log.info("requestReferral: SEND SUCCESS");

    try {
      mailService.send(
          referral.referringEmail(),
          "Ihre Überweisung ist eingegangen",
          referralConfirmationBody(referral, practiceEmail));
    } catch (MailException ex) {
      log.warn("requestReferral: could not send confirmation: {}", ex.getMessage());
    }
  }

  private String referralSubject(Referral referral) {
    String urgency =
        referral.urgency() == ReferralUrgency.ROUTINE
            ? ""
            : " (" + referral.urgency().label() + ")";
    return "Überweisung"
        + urgency
        + ": "
        + referral.species().strip()
        + " – "
        + referral.referringPractice().strip();
  }

  private String referralBody(Referral referral) {
    StringBuilder body = new StringBuilder("Überweisung über die Website.\n\n");
    body.append("Dringlichkeit: ").append(referral.urgency().label()).append("\n\n");
    body.append("ÜBERWEISENDE PRAXIS\n");
    appendLine(body, "Praxis", referral.referringPractice());
    appendLine(body, "Tierärztin/Tierarzt", referral.referringVetName());
    appendLine(body, "E-Mail", referral.referringEmail());
    appendLine(body, "Telefon", referral.referringPhone());
    body.append("\nTIERHALTER\n");
    appendLine(body, "Name", referral.ownerName());
    appendLine(body, "Kontakt", referral.ownerContact());
    body.append("\nPATIENT\n");
    appendLine(body, "Name", referral.patientName());
    appendLine(body, "Tierart", referral.species());
    appendLine(body, "Rasse", referral.breed());
    appendLine(body, "Alter", referral.age());
    body.append("\nFRAGESTELLUNG\n").append(referral.question().strip()).append('\n');
    if (hasText(referral.previousTreatment())) {
      body.append("\nVORBEHANDLUNG\n").append(referral.previousTreatment().strip()).append('\n');
    }
    return body.toString();
  }

  private String referralConfirmationBody(Referral referral, String practiceEmail) {
    return "Guten Tag "
        + referral.referringVetName().strip()
        + ",\n\n"
        + "vielen Dank für Ihre Überweisung. Sie ist bei uns eingegangen, wir melden uns bei"
        + " dem Tierhalter und halten Sie auf dem Laufenden.\n\n"
        + "Patient: "
        + referral.species().strip()
        + (hasText(referral.patientName()) ? " (" + referral.patientName().strip() + ")" : "")
        + "\nTierhalter: "
        + referral.ownerName().strip()
        + "\nDringlichkeit: "
        + referral.urgency().label()
        + "\n\nBefunde senden Sie bitte an "
        + practiceEmail
        + ".\n\nFreundliche Grüße\nTier. Gesund.";
  }

  private static void appendLine(StringBuilder body, String label, String value) {
    if (hasText(value)) {
      body.append(label).append(": ").append(value.strip()).append('\n');
    }
  }

  private static boolean hasText(String value) {
    return value != null && !value.isBlank();
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
    mailService.send(practiceEmail(), subject, body, replyToEmail);
  }

  private String practiceEmail() {
    return primaryContactEmailLookup
        .primaryEmail()
        .orElseThrow(
            () ->
                new IllegalStateException(
                    "Keine Kontakt-E-Mail konfiguriert. Bitte VetInfo über die Admin-Oberfläche pflegen."));
  }
}
