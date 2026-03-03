// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

import java.time.LocalDateTime;

public record ImageResponse(Long id, String fileName, String mimeType, LocalDateTime createdAt) {}
