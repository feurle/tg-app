package com.feurle.tg.user.infrastructure.rest.dto;

import java.util.Set;

public record AuthUserResponse(
        String login,
        String firstName,
        String lastName,
        String email,
        Set<String> authorities
) {
}
