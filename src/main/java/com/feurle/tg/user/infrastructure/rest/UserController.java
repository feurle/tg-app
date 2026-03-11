// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.rest;

import com.feurle.tg.user.application.UserService;
import com.feurle.tg.user.domain.entity.Authority;
import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.infrastructure.persistence.JpaAuthorityRepository;
import com.feurle.tg.user.infrastructure.rest.dto.CreateUserRequest;
import com.feurle.tg.user.infrastructure.rest.dto.UpdateUserRequest;
import com.feurle.tg.user.infrastructure.rest.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;
  private final PasswordEncoder passwordEncoder;
  private final JpaAuthorityRepository authorityRepository;

  @PostMapping
  public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
    User user = new User();
    user.setLogin(request.login());
    user.setPassword(passwordEncoder.encode(request.password()));
    user.setEmail(request.email());
    user.setFirstName(request.firstName());
    user.setLastName(request.lastName());
    user.setLangKey(request.langKey() != null ? request.langKey() : "de");
    user.setImageUrl(request.imageUrl());
    user.setActivated(false);

    if (request.authorities() != null && !request.authorities().isEmpty()) {
      Set<Authority> authorities =
          request.authorities().stream()
              .map(
                  name ->
                      authorityRepository
                          .findByName(name)
                          .orElseThrow(
                              () -> new IllegalArgumentException("Authority not found: " + name)))
              .collect(Collectors.toSet());
      user.setAuthorities(authorities);
    }

    User created = userService.createUser(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(mapToUserResponse(created));
  }

  @GetMapping
  public ResponseEntity<List<UserResponse>> getAllUsers() {
    List<UserResponse> users =
        userService.findAll().stream().map(this::mapToUserResponse).toList();
    return ResponseEntity.ok(users);
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
    return userService
        .findById(id)
        .map(user -> ResponseEntity.ok(mapToUserResponse(user)))
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/login/{login}")
  public ResponseEntity<UserResponse> getUserByLogin(@PathVariable String login) {
    return userService
        .findByLogin(login)
        .map(user -> ResponseEntity.ok(mapToUserResponse(user)))
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/email/{email}")
  public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
    return userService
        .findByEmail(email)
        .map(user -> ResponseEntity.ok(mapToUserResponse(user)))
        .orElse(ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserResponse> updateUser(
      @PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
    User userUpdate = new User();
    userUpdate.setEmail(request.email());
    if (request.password() != null && !request.password().isBlank()) {
      userUpdate.setPassword(passwordEncoder.encode(request.password()));
    }
    userUpdate.setFirstName(request.firstName());
    userUpdate.setLastName(request.lastName());
    userUpdate.setLangKey(request.langKey() != null ? request.langKey() : "de");
    userUpdate.setImageUrl(request.imageUrl());
    userUpdate.setActivated(request.activated());

    if (request.authorities() != null && !request.authorities().isEmpty()) {
      Set<Authority> authorities =
          request.authorities().stream()
              .map(
                  name ->
                      authorityRepository
                          .findByName(name)
                          .orElseThrow(
                              () -> new IllegalArgumentException("Authority not found: " + name)))
              .collect(Collectors.toSet());
      userUpdate.setAuthorities(authorities);
    }

    User updated = userService.updateUser(id, userUpdate);
    return ResponseEntity.ok(mapToUserResponse(updated));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }

  private UserResponse mapToUserResponse(User user) {
    return new UserResponse(
        user.getId(),
        user.getLogin(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        user.getActivated(),
        user.getLangKey(),
        user.getImageUrl(),
        user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toSet()),
        user.getCreatedDate(),
        user.getCreatedBy(),
        user.getLastModifiedDate(),
        user.getLastModifiedBy());
  }
}
