// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.rest.dto;

import java.util.List;

public record AuthResponse(String login, List<String> authorities) {}
