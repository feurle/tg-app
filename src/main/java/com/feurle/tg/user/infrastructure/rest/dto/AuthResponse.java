package com.feurle.tg.user.infrastructure.rest.dto;

import java.util.List;

public record AuthResponse(
    String login,
    List<String> authorities
) {
}
