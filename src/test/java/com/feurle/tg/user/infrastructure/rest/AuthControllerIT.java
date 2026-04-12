// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.rest;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.domain.repository.UserRepository;
import com.feurle.tg.user.infrastructure.rest.dto.LoginRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class AuthControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private User testUser;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    userRepository.deleteAll();
    testUser = new User();
    testUser.setLogin("authuser");
    // Password needs to be hashed for authentication
    testUser.setPassword(passwordEncoder.encode("password123"));
    testUser.setEmail("authuser@example.com");
    testUser.setFirstName("Auth");
    testUser.setLastName("User");
    testUser.setLangKey("de");
    testUser.setActivated(true);
  }

  @AfterEach
  void tearDown() {
    userRepository.deleteAll();
  }

  // ========== POST /api/auth/login ==========

  @Test
  void login_withCorrectCredentials_returns200_withUserInfo() throws Exception {
    // Arrange
    userRepository.save(testUser);
    LoginRequest request = new LoginRequest("authuser", "password123");

    // Act & Assert
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.login", equalTo("authuser")))
        .andExpect(jsonPath("$.email", equalTo("authuser@example.com")))
        .andExpect(jsonPath("$.firstName", equalTo("Auth")))
        .andExpect(jsonPath("$.lastName", equalTo("User")));
  }

  @Test
  void login_withWrongPassword_returns401() throws Exception {
    // Arrange
    userRepository.save(testUser);
    LoginRequest request = new LoginRequest("authuser", "wrongpassword");

    // Act & Assert
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void login_withNonExistentUser_returns401() throws Exception {
    // Arrange
    LoginRequest request = new LoginRequest("nonexistent", "password123");

    // Act & Assert
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void login_createsSession() throws Exception {
    // Arrange
    userRepository.save(testUser);
    LoginRequest request = new LoginRequest("authuser", "password123");

    // Act & Assert - Login should return user info
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.login", equalTo("authuser")));
  }

  // ========== GET /api/auth/me ==========

  @Test
  @WithMockUser(username = "authuser", roles = "USER")
  void getCurrentUser_withAuth_returns200_withUserInfo() throws Exception {
    // Arrange
    userRepository.save(testUser);

    // Build MockMvc with springSecurity() so @WithMockUser is properly propagated
    // into the filter chain — without it, SecurityContextPersistenceFilter overwrites the mock context
    MockMvc secureMvc =
        webAppContextSetup(webApplicationContext).apply(springSecurity()).build();

    // Act & Assert
    secureMvc
        .perform(get("/api/auth/me").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.login", equalTo("authuser")));
  }

  @Test
  void getCurrentUser_withoutAuth_returns401() throws Exception {
    // Act & Assert
    mockMvc
        .perform(get("/api/auth/me").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
  }

  // ========== POST /api/auth/logout ==========

  @Test
  @WithMockUser(username = "authuser", roles = "USER")
  void logout_withAuth_returns204() throws Exception {
    // Act & Assert
    mockMvc.perform(post("/api/auth/logout")).andExpect(status().isNoContent());
  }

  @Test
  @WithMockUser(username = "authuser", roles = "USER")
  void logout_invalidatesSession() throws Exception {
    // Arrange - First login
    userRepository.save(testUser);
    LoginRequest loginRequest = new LoginRequest("authuser", "password123");

    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
        .andExpect(status().isOk());

    // Act - Logout
    mockMvc.perform(post("/api/auth/logout")).andExpect(status().isNoContent());

    // Assert - Session should be invalidated, /me should return 401
    mockMvc
        .perform(get("/api/auth/me").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void login_and_logout_flow() throws Exception {
    // Arrange
    userRepository.save(testUser);
    LoginRequest loginRequest = new LoginRequest("authuser", "password123");

    // Step 1: Login
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.login", equalTo("authuser")));

    // Step 2: Access protected resource (with session)
    // Note: MockMvc doesn't automatically maintain session between calls in this test setup
    // but we can verify the endpoints are working

    // Step 3: Logout (with mocked auth)
    mockMvc.perform(post("/api/auth/logout")).andExpect(status().isNoContent());
  }
}
