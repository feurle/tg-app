// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import com.feurle.tg.contact.domain.OfficeHour;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class ContactInfoServiceTest {

  @Autowired private ContactInfoService contactInfoService;

  @Autowired private ContactInfoRepository contactInfoRepository;

  @BeforeEach
  void setUp() {
    contactInfoRepository.deleteAll();
  }

  @Test
  void getContactInfo_returnsEmpty_whenNoDataExists() {
    Optional<ContactInfo> result = contactInfoService.getContactInfo();

    assertThat(result).isEmpty();
  }

  @Test
  void upsertContactInfo_createsNewRecord() {
    List<OfficeHour> officeHours = List.of(new OfficeHour("Montag – Freitag", "09:00 – 18:00"));

    ContactInfo result =
        contactInfoService.upsertContactInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            officeHours);

    assertThat(result.getId()).isNotNull();
    assertThat(result.getName()).isEqualTo("Tiergesund Praxis");
    assertThat(result.getPhone()).isEqualTo("+49 89 123456");
    assertThat(result.getEmail()).isEqualTo("praxis@example.de");
    assertThat(result.getStreet()).isEqualTo("Musterstr. 1");
    assertThat(result.getCity()).isEqualTo("München");
    assertThat(result.getZip()).isEqualTo("80331");
    assertThat(result.getOfficeHours()).hasSize(1);
    assertThat(result.getUpdatedAt()).isNotNull();
  }

  @Test
  void upsertContactInfo_updatesExistingRecord() {
    contactInfoService.upsertContactInfo(
        "Alte Praxis", "+49 89 111111", "alt@example.de", "Alte Str. 1", "Hamburg", "20095",
        List.of());

    ContactInfo updated =
        contactInfoService.upsertContactInfo(
            "Neue Praxis", "+49 89 999999", "neu@example.de", "Neue Str. 2", "Berlin", "10115",
            List.of());

    assertThat(contactInfoRepository.findAll()).hasSize(1);
    assertThat(updated.getPhone()).isEqualTo("+49 89 999999");
    assertThat(updated.getEmail()).isEqualTo("neu@example.de");
    assertThat(updated.getCity()).isEqualTo("Berlin");
  }

  @Test
  void upsertContactInfo_replacesOfficeHours() {
    List<OfficeHour> initial =
        List.of(
            new OfficeHour("Montag – Freitag", "09:00 – 18:00"),
            new OfficeHour("Samstag", "09:00 – 13:00"));
    contactInfoService.upsertContactInfo(
        "Tiergesund Praxis", "+49 89 123456", "praxis@example.de", "Musterstr. 1", "München",
        "80331", initial);

    List<OfficeHour> updated = List.of(new OfficeHour("Montag – Freitag", "10:00 – 17:00"));
    ContactInfo result =
        contactInfoService.upsertContactInfo(
            "Tiergesund Praxis", "+49 89 123456", "praxis@example.de", "Musterstr. 1", "München",
            "80331", updated);

    assertThat(result.getOfficeHours()).hasSize(1);
    assertThat(result.getOfficeHours().get(0).getHours()).isEqualTo("10:00 – 17:00");
  }
}
