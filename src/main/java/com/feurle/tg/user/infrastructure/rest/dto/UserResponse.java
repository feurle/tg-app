package com.feurle.tg.user.infrastructure.rest.dto;

import java.time.Instant;
import java.util.Set;

public record UserResponse(
        Long id,
        String login,
        String email,
        String firstName,
        String lastName,
        Boolean activated,
        String langKey,
        String imageUrl,
        Set<String> authorities,
        Instant createdDate,
        String createdBy,
        Instant lastModifiedDate,
        String lastModifiedBy
) {}
