// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.vetinfo.infrastructure.rest;

import com.feurle.tg.vetinfo.application.VetInfoService;
import com.feurle.tg.vetinfo.domain.VetInfo;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.UpsertVetInfoRequest;
import com.feurle.tg.vetinfo.infrastructure.rest.dto.VetInfoResponse;
import com.feurle.tg.vetinfo.infrastructure.rest.mapper.VetInfoMapper;
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
@RequestMapping("/api/vetinfo")
@RequiredArgsConstructor
public class VetInfoController {

  private final VetInfoService vetInfoService;
  private final VetInfoMapper vetInfoMapper;

  @GetMapping
  public ResponseEntity<List<VetInfoResponse>> getAllVetInfo() {
    log.info("getAllVetInfo: GET /api/vetinfo");
    List<VetInfoResponse> response =
        vetInfoService.getAllVetInfo().stream().map(vetInfoMapper::toResponse).toList();
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<VetInfoResponse> getVetInfoById(@PathVariable Long id) {
    log.info("getVetInfoById: GET /api/vetinfo/{}", id);
    return ResponseEntity.ok(vetInfoMapper.toResponse(vetInfoService.getVetInfoById(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<VetInfoResponse> createVetInfo(
      @Valid @RequestBody UpsertVetInfoRequest request) {
    log.info("createVetInfo: POST /api/vetinfo");
    VetInfo saved =
        vetInfoService.createVetInfo(
            request.name(),
            request.phone(),
            request.email(),
            request.street(),
            request.city(),
            request.zip(),
            request.primary(),
            vetInfoMapper.toDomain(request.officeHours()));
    return ResponseEntity.status(HttpStatus.CREATED).body(vetInfoMapper.toResponse(saved));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<VetInfoResponse> updateVetInfo(
      @PathVariable Long id, @Valid @RequestBody UpsertVetInfoRequest request) {
    log.info("updateVetInfo: PUT /api/vetinfo/{}", id);
    VetInfo saved =
        vetInfoService.updateVetInfo(
            id,
            request.name(),
            request.phone(),
            request.email(),
            request.street(),
            request.city(),
            request.zip(),
            request.primary(),
            vetInfoMapper.toDomain(request.officeHours()));
    return ResponseEntity.ok(vetInfoMapper.toResponse(saved));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteVetInfo(@PathVariable Long id) {
    log.info("deleteVetInfo: DELETE /api/vetinfo/{}", id);
    vetInfoService.deleteVetInfo(id);
    return ResponseEntity.noContent().build();
  }
}
