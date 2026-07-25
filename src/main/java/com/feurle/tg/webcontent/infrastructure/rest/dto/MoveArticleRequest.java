// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

import com.feurle.tg.webcontent.domain.enumeration.MoveDirection;
import jakarta.validation.constraints.NotNull;

public record MoveArticleRequest(@NotNull MoveDirection direction) {}
