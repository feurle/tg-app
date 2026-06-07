// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.rest;

import com.feurle.tg.user.application.UserService;
import com.feurle.tg.user.domain.entity.Authority;
import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.infrastructure.rest.dto.AuthUserResponse;
import com.feurle.tg.user.infrastructure.rest.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final UserService userService;

  @PostMapping("/login")
  public ResponseEntity<?> login(
      @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
    try {
      Authentication authentication =
          authenticationManager.authenticate(
              new UsernamePasswordAuthenticationToken(request.login(), request.password()));

      SecurityContext context = SecurityContextHolder.createEmptyContext();
      context.setAuthentication(authentication);
      SecurityContextHolder.setContext(context);

      // Protect against session fixation: destroy any pre-existing session, then create a fresh one
      HttpSession existing = servletRequest.getSession(false);
      if (existing != null) {
        existing.invalidate();
      }
      HttpSession session = servletRequest.getSession(true);
      session.setAttribute(
          HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

      return userService
          .findByLogin(request.login())
          .map(user -> ResponseEntity.ok((Object) mapToAuthUserResponse(user)))
          .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());

    } catch (BadCredentialsException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "Invalid credentials"));
    } catch (AuthenticationException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.noContent().build();
    }

    return userService
        .findByLogin(authentication.getName())
        .map(user -> ResponseEntity.ok((Object) mapToAuthUserResponse(user)))
        .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletRequest request) {
    SecurityContextHolder.clearContext();
    HttpSession session = request.getSession(false);
    if (session != null) {
      session.invalidate();
    }
    return ResponseEntity.noContent().build();
  }

  private AuthUserResponse mapToAuthUserResponse(User user) {
    return new AuthUserResponse(
        user.getLogin(),
        user.getFirstName(),
        user.getLastName(),
        user.getEmail(),
        user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toSet()));
  }
}
