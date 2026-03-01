package com.feurle.tg.user.infrastructure.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateUserRequest(
        @NotBlank(message = "Login is required")
        @Size(min = 3, max = 50, message = "Login must be between 3 and 50 characters")
        String login,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
        String password,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        String firstName,
        String lastName,
        String langKey,
        String imageUrl,
        Set<String> authorities
) {}
