// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.application;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.vetinfo.domain.OfficeHour;
import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.domain.VetInfoRepository;
import java.util.List;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class VetInfoServiceTest {

  @Autowired private VetInfoService vetInfoService;

  @Autowired private VetInfoRepository vetInfoRepository;

  @BeforeEach
  void setUp() {
    vetInfoRepository.deleteAll();
  }

  // ========== getVetInfo (primary) ==========

  @Test
  void getVetInfo_returnsEmpty_whenNoPrimaryExists() {
    vetInfoService.createVetInfo("Praxis A", null, null, null, null, null, false, List.of());
    assertThat(vetInfoService.getVetInfo()).isEmpty();
  }

  @Test
  void getVetInfo_returnsPrimaryRecord() {
    vetInfoService.createVetInfo("Praxis A", null, null, null, null, null, false, List.of());
    VetInfo primary =
        vetInfoService.createVetInfo(
            "Praxis B", "+49 89 2", "b@example.de", null, null, null, true, List.of());

    assertThat(vetInfoService.getVetInfo())
        .isPresent()
        .get()
        .extracting(VetInfo::getId)
        .isEqualTo(primary.getId());
  }

  // ========== primaryEmail ==========

  @Test
  void primaryEmail_returnsEmpty_whenNoPrimaryExists() {
    assertThat(vetInfoService.primaryEmail()).isEmpty();
  }

  @Test
  void primaryEmail_returnsEmailOfPrimaryRecord() {
    vetInfoService.createVetInfo(
        "Praxis A", null, "a@example.de", null, null, null, true, List.of());
    assertThat(vetInfoService.primaryEmail()).contains("a@example.de");
  }

  // ========== getAllVetInfo ==========

  @Test
  void getAllVetInfo_returnsAllRecords() {
    vetInfoService.createVetInfo(
        "Praxis A", "+49 89 1", "a@example.de", "Str. 1", "München", "80331", false, List.of());
    vetInfoService.createVetInfo(
        "Praxis B", "+49 89 2", "b@example.de", "Str. 2", "Berlin", "10115", false, List.of());

    assertThat(vetInfoService.getAllVetInfo()).hasSize(2);
  }

  // ========== getVetInfoById ==========

  @Test
  void getVetInfoById_returnsRecord() {
    VetInfo created =
        vetInfoService.createVetInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of());

    VetInfo found = vetInfoService.getVetInfoById(created.getId());

    assertThat(found.getId()).isEqualTo(created.getId());
    assertThat(found.getName()).isEqualTo("Tiergesund Praxis");
  }

  @Test
  void getVetInfoById_throwsWhenNotFound() {
    assertThatThrownBy(() -> vetInfoService.getVetInfoById(999L))
        .isInstanceOf(NoSuchElementException.class);
  }

  // ========== createVetInfo ==========

  @Test
  void createVetInfo_persistsNewRecord() {
    List<OfficeHour> officeHours = List.of(new OfficeHour("Montag – Freitag", "09:00 – 18:00"));

    VetInfo result =
        vetInfoService.createVetInfo(
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
  void createVetInfo_settingPrimary_clearsPreviousPrimary() {
    VetInfo first =
        vetInfoService.createVetInfo("Praxis A", null, null, null, null, null, true, List.of());
    VetInfo second =
        vetInfoService.createVetInfo("Praxis B", null, null, null, null, null, true, List.of());

    assertThat(vetInfoService.getVetInfoById(first.getId()).isPrimary()).isFalse();
    assertThat(vetInfoService.getVetInfoById(second.getId()).isPrimary()).isTrue();
  }

  @Test
  void createVetInfo_allowsMultipleNonPrimaryRecords() {
    vetInfoService.createVetInfo(
        "Praxis A", "+49 89 1", "a@example.de", "Str. 1", "München", "80331", false, List.of());
    vetInfoService.createVetInfo(
        "Praxis B", "+49 89 2", "b@example.de", "Str. 2", "Berlin", "10115", false, List.of());

    assertThat(vetInfoRepository.findAll()).hasSize(2);
    assertThat(vetInfoRepository.findByPrimaryTrue()).isEmpty();
  }

  // ========== updateVetInfo ==========

  @Test
  void updateVetInfo_updatesExistingRecord() {
    VetInfo created =
        vetInfoService.createVetInfo(
            "Alte Praxis",
            "+49 89 111111",
            "alt@example.de",
            "Alte Str. 1",
            "Hamburg",
            "20095",
            false,
            List.of());

    VetInfo updated =
        vetInfoService.updateVetInfo(
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
  void updateVetInfo_settingPrimary_clearsPreviousPrimary() {
    VetInfo first =
        vetInfoService.createVetInfo("Praxis A", null, null, null, null, null, true, List.of());
    VetInfo second =
        vetInfoService.createVetInfo("Praxis B", null, null, null, null, null, false, List.of());

    vetInfoService.updateVetInfo(
        second.getId(), "Praxis B", null, null, null, null, null, true, List.of());

    assertThat(vetInfoService.getVetInfoById(first.getId()).isPrimary()).isFalse();
    assertThat(vetInfoService.getVetInfoById(second.getId()).isPrimary()).isTrue();
  }

  @Test
  void updateVetInfo_replacesOfficeHours() {
    VetInfo created =
        vetInfoService.createVetInfo(
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

    VetInfo result =
        vetInfoService.updateVetInfo(
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
  void updateVetInfo_throwsWhenNotFound() {
    assertThatThrownBy(
            () ->
                vetInfoService.updateVetInfo(
                    999L, "X", null, null, null, null, null, false, List.of()))
        .isInstanceOf(NoSuchElementException.class);
  }

  // ========== deleteVetInfo ==========

  @Test
  void deleteVetInfo_removesRecord() {
    VetInfo created =
        vetInfoService.createVetInfo(
            "Tiergesund Praxis",
            "+49 89 123456",
            "praxis@example.de",
            "Musterstr. 1",
            "München",
            "80331",
            false,
            List.of());

    vetInfoService.deleteVetInfo(created.getId());

    assertThat(vetInfoRepository.findAll()).isEmpty();
  }

  @Test
  void deleteVetInfo_throwsWhenNotFound() {
    assertThatThrownBy(() -> vetInfoService.deleteVetInfo(999L))
        .isInstanceOf(NoSuchElementException.class);
  }
}
