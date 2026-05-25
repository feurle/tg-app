// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

public record UpdateSectionRequest(int order, String title, String content) {}
