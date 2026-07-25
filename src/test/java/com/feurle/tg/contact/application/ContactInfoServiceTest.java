// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.contact.application;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.contact.domain.ContactInfo;
import com.feurle.tg.contact.domain.ContactInfoRepository;
import com.feurle.tg.contact.domain.OfficeHour;
import java.util.List;
import java.util.NoSuchElementException;
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

  // ========== getContactInfo (primary) ==========

  @Test
  void getContactInfo_returnsEmpty_whenNoPrimaryExists() {
    contactInfoService.createContactInfo(
        "Praxis A", null, null, null, null, null, false, List.of());
    assertThat(contactInfoService.getContactInfo()).isEmpty();
  }

  @Test
  void getContactInfo_returnsPrimaryRecord() {
    contactInfoService.createContactInfo(
        "Praxis A", null, null, null, null, null, false, List.of());
    ContactInfo primary =
        contactInfoService.createContactInfo(
            "Praxis B", "+49 89 2", "b@example.de", null, null, null, true, List.of());

    assertThat(contactInfoService.getContactInfo())
        .isPresent()
        .get()
        .extracting(ContactInfo::getId)
        .isEqualTo(primary.getId());
  }

  // ========== getAllContactInfo ==========

  @Test
  void getAllContactInfo_returnsAllRecords() {
    contactInfoService.createContactInfo(
        "Praxis A", "+49 89 1", "a@example.de", "Str. 1", "München", "80331", false, List.of());
    contactInfoService.createContactInfo(
        "Praxis B", "+49 89 2", "b@example.de", "Str. 2", "Berlin", "10115", false, List.of());

    assertThat(contactInfoService.getAllContactInfo()).hasSize(2);
  }

  // ========== getContactInfoById ==========

  @Test
  void getContactInfoById_returnsRecord() {
    ContactInfo created =
        contactInfoService.createContactInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of());

    ContactInfo found = contactInfoService.getContactInfoById(created.getId());

    assertThat(found.getId()).isEqualTo(created.getId());
    assertThat(found.getName()).isEqualTo("Tiergesund Praxis");
  }

  @Test
  void getContactInfoById_throwsWhenNotFound() {
    assertThatThrownBy(() -> contactInfoService.getContactInfoById(999L))
        .isInstanceOf(NoSuchElementException.class);
  }

  // ========== createContactInfo ==========

  @Test
  void createContactInfo_persistsNewRecord() {
    List<OfficeHour> officeHours = List.of(new OfficeHour("Montag – Freitag", "09:00 – 18:00"));

    ContactInfo result =
        contactInfoService.createContactInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            true,
            officeHours);

    assertThat(result.getId()).isNotNull();
    assertThat(result.getName()).isEqualTo("Tiergesund Praxis");
    assertThat(result.getPhone()).isEqualTo("+49 89 123456");
    assertThat(result.getEmail()).isEqualTo("praxis@example.de");
    assertThat(result.getStreet()).isEqualTo("Musterstr. 1");
    assertThat(result.getCity()).isEqualTo("München");
    assertThat(result.getZip()).isEqualTo("80331");
    assertThat(result.isPrimary()).isTrue();
    assertThat(result.getOfficeHours()).hasSize(1);
    assertThat(result.getUpdatedAt()).isNotNull();
  }

  @Test
  void createContactInfo_settingPrimary_clearsPreviousPrimary() {
    ContactInfo first =
        contactInfoService.createContactInfo(
            "Praxis A", null, null, null, null, null, true, List.of());
    ContactInfo second =
        contactInfoService.createContactInfo(
            "Praxis B", null, null, null, null, null, true, List.of());

    assertThat(contactInfoService.getContactInfoById(first.getId()).isPrimary()).isFalse();
    assertThat(contactInfoService.getContactInfoById(second.getId()).isPrimary()).isTrue();
  }

  @Test
  void createContactInfo_allowsMultipleNonPrimaryRecords() {
    contactInfoService.createContactInfo(
        "Praxis A", "+49 89 1", "a@example.de", "Str. 1", "München", "80331", false, List.of());
    contactInfoService.createContactInfo(
        "Praxis B", "+49 89 2", "b@example.de", "Str. 2", "Berlin", "10115", false, List.of());

    assertThat(contactInfoRepository.findAll()).hasSize(2);
    assertThat(contactInfoRepository.findByPrimaryTrue()).isEmpty();
  }

  // ========== updateContactInfo ==========

  @Test
  void updateContactInfo_updatesExistingRecord() {
    ContactInfo created =
        contactInfoService.createContactInfo(
            "Alte Praxis",
            "+49 89 111111",
            "alt@example.de",
            "Alte Str. 1",
            "Hamburg",
            "20095",
            false,
            List.of());

    ContactInfo updated =
        contactInfoService.updateContactInfo(
            created.getId(),
            "Neue Praxis",
            "+49 89 999999",
            "neu@example.de",
            "Neue Str. 2",
            "Berlin",
            "10115",
            false,
            List.of());

    assertThat(updated.getId()).isEqualTo(created.getId());
    assertThat(updated.getName()).isEqualTo("Neue Praxis");
    assertThat(updated.getPhone()).isEqualTo("+49 89 999999");
    assertThat(updated.getEmail()).isEqualTo("neu@example.de");
    assertThat(updated.getCity()).isEqualTo("Berlin");
  }

  @Test
  void updateContactInfo_settingPrimary_clearsPreviousPrimary() {
    ContactInfo first =
        contactInfoService.createContactInfo(
            "Praxis A", null, null, null, null, null, true, List.of());
    ContactInfo second =
        contactInfoService.createContactInfo(
            "Praxis B", null, null, null, null, null, false, List.of());

    contactInfoService.updateContactInfo(
        second.getId(), "Praxis B", null, null, null, null, null, true, List.of());

    assertThat(contactInfoService.getContactInfoById(first.getId()).isPrimary()).isFalse();
    assertThat(contactInfoService.getContactInfoById(second.getId()).isPrimary()).isTrue();
  }

  @Test
  void updateContactInfo_replacesOfficeHours() {
    ContactInfo created =
        contactInfoService.createContactInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of(
                new OfficeHour("Montag – Freitag", "09:00 – 18:00"),
                new OfficeHour("Samstag", "09:00 – 13:00")));

    ContactInfo result =
        contactInfoService.updateContactInfo(
            created.getId(),
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of(new OfficeHour("Montag – Freitag", "10:00 – 17:00")));

    assertThat(result.getOfficeHours()).hasSize(1);
    assertThat(result.getOfficeHours().get(0).getHours()).isEqualTo("10:00 – 17:00");
  }

  @Test
  void updateContactInfo_throwsWhenNotFound() {
    assertThatThrownBy(
            () ->
                contactInfoService.updateContactInfo(
                    999L, "X", null, null, null, null, null, false, List.of()))
        .isInstanceOf(NoSuchElementException.class);
  }

  // ========== deleteContactInfo ==========

  @Test
  void deleteContactInfo_removesRecord() {
    ContactInfo created =
        contactInfoService.createContactInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of());

    contactInfoService.deleteContactInfo(created.getId());

    assertThat(contactInfoRepository.findAll()).isEmpty();
  }

  @Test
  void deleteContactInfo_throwsWhenNotFound() {
    assertThatThrownBy(() -> contactInfoService.deleteContactInfo(999L))
        .isInstanceOf(NoSuchElementException.class);
  }
}
