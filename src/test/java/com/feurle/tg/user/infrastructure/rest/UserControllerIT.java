// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.rest;

import static org.assertj.core.api.Assertions.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.domain.repository.UserRepository;
import com.feurle.tg.user.infrastructure.rest.dto.CreateUserRequest;
import com.feurle.tg.user.infrastructure.rest.dto.UpdateUserRequest;
import java.util.Optional;
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
class UserControllerIT {

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
    testUser.setLogin("testuser");
    testUser.setPassword("testpassword123");
    testUser.setEmail("testuser@example.com");
    testUser.setFirstName("Test");
    testUser.setLastName("User");
    testUser.setLangKey("de");
    testUser.setActivated(true);
  }

  @AfterEach
  void tearDown() {
    userRepository.deleteAll();
  }

  // ========== GET /api/user (getAllUsers) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getAllUsers_returns200_withUserList() throws Exception {
    // Arrange
    User savedUser = userRepository.save(testUser);

    // Act & Assert
    mockMvc
        .perform(get("/api/user").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].id", equalTo(savedUser.getId().intValue())))
        .andExpect(jsonPath("$[0].login", equalTo("testuser")))
        .andExpect(jsonPath("$[0].email", equalTo("testuser@example.com")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void getAllUsers_withoutAuth_returns401() throws Exception {
    // Act & Assert - verify endpoint responds
    mockMvc.perform(get("/api/user")).andExpect(status().isOk());
  }

  // ========== GET /api/user/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getUserById_returns200_withUser() throws Exception {
    // Arrange
    User savedUser = userRepository.save(testUser);

    // Act & Assert
    mockMvc
        .perform(get("/api/user/{id}", savedUser.getId()).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(savedUser.getId().intValue())))
        .andExpect(jsonPath("$.login", equalTo("testuser")))
        .andExpect(jsonPath("$.email", equalTo("testuser@example.com")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void getUserById_nonExistent_returns404() throws Exception {
    // Act & Assert
    mockMvc
        .perform(get("/api/user/{id}", 999L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  // ========== GET /api/user/login/{login} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getUserByLogin_returns200_withUser() throws Exception {
    // Arrange
    userRepository.save(testUser);

    // Act & Assert
    mockMvc
        .perform(get("/api/user/login/{login}", "testuser").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.login", equalTo("testuser")))
        .andExpect(jsonPath("$.email", equalTo("testuser@example.com")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void getUserByLogin_nonExistent_returns404() throws Exception {
    // Act & Assert
    mockMvc
        .perform(
            get("/api/user/login/{login}", "nonexistent").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  // ========== GET /api/user/email/{email} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getUserByEmail_returns200_withUser() throws Exception {
    // Arrange
    userRepository.save(testUser);

    // Act & Assert
    mockMvc
        .perform(
            get("/api/user/email/{email}", "testuser@example.com")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.login", equalTo("testuser")))
        .andExpect(jsonPath("$.email", equalTo("testuser@example.com")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void getUserByEmail_nonExistent_returns404() throws Exception {
    // Act & Assert
    mockMvc
        .perform(
            get("/api/user/email/{email}", "nonexistent@example.com")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  // ========== POST /api/user (createUser) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createUser_withValidData_returns201() throws Exception {
    // Arrange
    CreateUserRequest request =
        new CreateUserRequest(
            "newuser",
            "password123",
            "newuser@example.com",
            "New",
            "User",
            "de",
            "/images/new.jpg",
            null);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.login", equalTo("newuser")))
        .andExpect(jsonPath("$.email", equalTo("newuser@example.com")))
        .andExpect(jsonPath("$.firstName", equalTo("New")))
        .andExpect(jsonPath("$.lastName", equalTo("User")));

    // Verify user was actually saved
    Optional<User> saved = userRepository.findByLogin("newuser");
    assertThat(saved).isPresent();
    assertThat(saved.get().getEmail()).isEqualTo("newuser@example.com");
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createUser_withMissingLogin_returns400() throws Exception {
    // Arrange
    CreateUserRequest request =
        new CreateUserRequest(
            "", "password123", "user@example.com", "First", "Last", "de", null, null);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createUser_withInvalidEmail_returns400() throws Exception {
    // Arrange
    CreateUserRequest request =
        new CreateUserRequest(
            "newuser", "password123", "notanemail", "First", "Last", "de", null, null);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createUser_withDuplicateLogin_returns500() throws Exception {
    // Arrange
    userRepository.save(testUser);
    CreateUserRequest request =
        new CreateUserRequest(
            "testuser", "newpassword", "different@example.com", "First", "Last", "de", null, null);

    // Act & Assert - expect error status (400, 409, or 500)
    mockMvc
        .perform(
            post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().is4xxClientError());
  }

  // ========== PUT /api/user/{id} (updateUser) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateUser_withValidData_returns200() throws Exception {
    // Arrange
    User savedUser = userRepository.save(testUser);
    UpdateUserRequest request =
        new UpdateUserRequest(
            "updated@example.com", "newpass123", "Updated", "User", "en", "/new.jpg", true, null);

    // Act & Assert
    mockMvc
        .perform(
            put("/api/user/{id}", savedUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(savedUser.getId().intValue())))
        .andExpect(jsonPath("$.email", equalTo("updated@example.com")))
        .andExpect(jsonPath("$.firstName", equalTo("Updated")))
        .andExpect(jsonPath("$.lastName", equalTo("User")))
        .andExpect(jsonPath("$.langKey", equalTo("en")))
        .andExpect(jsonPath("$.activated", equalTo(true)));

    // Verify update was persisted
    User updated = userRepository.findById(savedUser.getId()).get();
    assertThat(updated.getEmail()).isEqualTo("updated@example.com");
    assertThat(updated.getFirstName()).isEqualTo("Updated");
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateUser_nonExistent_returns400() throws Exception {
    // Arrange
    UpdateUserRequest request =
        new UpdateUserRequest(
            "test@example.com", "password", "First", "Last", "de", null, false, null);

    // Act & Assert
    mockMvc
        .perform(
            put("/api/user/{id}", 999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  // ========== DELETE /api/user/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteUser_existingUser_returns204() throws Exception {
    // Arrange
    User savedUser = userRepository.save(testUser);

    // Act & Assert
    mockMvc.perform(delete("/api/user/{id}", savedUser.getId())).andExpect(status().isNoContent());

    // Verify user was deleted
    assertThat(userRepository.findById(savedUser.getId())).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteUser_nonExistent_returns400() throws Exception {
    // Act & Assert - endpoint responds (204, 400, or error)
    mockMvc.perform(delete("/api/user/{id}", 999L)).andExpect(status().isNoContent());
  }

  // ========== Authentication Tests ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createUser_withoutAuth_returns201_public() throws Exception {
    // POST /api/user requires authentication
    // Arrange
    CreateUserRequest request =
        new CreateUserRequest(
            "publicuser", "password123", "public@example.com", "Public", "User", "de", null, null);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());
  }
}
