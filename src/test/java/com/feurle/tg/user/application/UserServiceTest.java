// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.application;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.domain.repository.UserRepository;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class UserServiceTest {

  @Autowired private UserService userService;

  @Autowired private UserRepository userRepository;

  private List<User> testUsersFromCsv;

  @BeforeEach
  void setUp() {
    userRepository.deleteAll();
    testUsersFromCsv = loadUsersFromCsv();
  }

  private List<User> loadUsersFromCsv() {
    List<User> users = new ArrayList<>();
    try (BufferedReader reader =
        new BufferedReader(
            new InputStreamReader(
                new ClassPathResource("users.csv").getInputStream(), StandardCharsets.UTF_8))) {
      String headerLine = reader.readLine();
      String line;
      while ((line = reader.readLine()) != null) {
        String[] fields = line.split(",");
        User user = new User();
        user.setLogin(fields[0]);
        user.setPassword(fields[1]);
        user.setFirstName(fields[2]);
        user.setLastName(fields[3]);
        user.setEmail(fields[4]);
        user.setActivated(Boolean.parseBoolean(fields[5]));
        user.setLangKey(fields[6]);
        user.setImageUrl(fields[7]);
        users.add(user);
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to load users from CSV", e);
    }
    return users;
  }

  @Test
  void createUser_savesAndReturnsUser() {
    User userToCreate = testUsersFromCsv.get(0);

    User created = userService.createUser(userToCreate);

    assertThat(created.getId()).isNotNull();
    assertThat(created.getLogin()).isEqualTo("john_doe");
    assertThat(created.getFirstName()).isEqualTo("John");
    assertThat(created.getLastName()).isEqualTo("Doe");
    assertThat(created.getEmail()).isEqualTo("john.doe@example.com");
    assertThat(created.getPassword()).isEqualTo("password123");
    assertThat(created.getActivated()).isTrue();
    assertThat(created.getLangKey()).isEqualTo("de");
    assertThat(created.getImageUrl()).isEqualTo("/images/john.jpg");
  }

  @Test
  void createMultipleUsers_fromCsv() {
    List<User> createdUsers = new ArrayList<>();
    for (User user : testUsersFromCsv) {
      createdUsers.add(userService.createUser(user));
    }

    List<User> allUsers = userService.findAll();

    assertThat(allUsers).hasSize(4);
    assertThat(createdUsers).hasSize(4);
    assertThat(allUsers.get(0).getLogin()).isEqualTo("john_doe");
    assertThat(allUsers.get(1).getLogin()).isEqualTo("jane_smith");
    assertThat(allUsers.get(2).getLogin()).isEqualTo("max_mueller");
    assertThat(allUsers.get(3).getLogin()).isEqualTo("lisa_weber");
  }

  @Test
  void findUserByLogin_returnsUser() {
    User userToCreate = testUsersFromCsv.get(0);
    userService.createUser(userToCreate);

    Optional<User> found = userService.findByLogin("john_doe");

    assertThat(found).isPresent();
    assertThat(found.get().getEmail()).isEqualTo("john.doe@example.com");
    assertThat(found.get().getFirstName()).isEqualTo("John");
  }

  @Test
  void findUserByEmail_returnsUser() {
    User userToCreate = testUsersFromCsv.get(1);
    userService.createUser(userToCreate);

    Optional<User> found = userService.findByEmail("jane.smith@example.com");

    assertThat(found).isPresent();
    assertThat(found.get().getLogin()).isEqualTo("jane_smith");
    assertThat(found.get().getFirstName()).isEqualTo("Jane");
  }

  @Test
  void updateUser_updatesAndReturnsUser() {
    User userToCreate = testUsersFromCsv.get(0);
    User created = userService.createUser(userToCreate);

    User userUpdate = new User();
    userUpdate.setEmail("john.doe.new@example.com");
    userUpdate.setPassword("newPassword123");
    userUpdate.setFirstName("Johnny");
    userUpdate.setLastName("Doe-Smith");
    userUpdate.setLangKey("en");
    userUpdate.setImageUrl("/images/john-new.jpg");
    userUpdate.setActivated(false);

    User updated = userService.updateUser(created.getId(), userUpdate);

    assertThat(updated.getId()).isEqualTo(created.getId());
    assertThat(updated.getFirstName()).isEqualTo("Johnny");
    assertThat(updated.getLastName()).isEqualTo("Doe-Smith");
    assertThat(updated.getEmail()).isEqualTo("john.doe.new@example.com");
    assertThat(updated.getPassword()).isEqualTo("newPassword123");
    assertThat(updated.getLangKey()).isEqualTo("en");
    assertThat(updated.getActivated()).isFalse();
  }

  @Test
  void deleteUser_removesUserFromRepository() {
    User userToCreate = testUsersFromCsv.get(0);
    User created = userService.createUser(userToCreate);

    assertThat(userService.findById(created.getId())).isPresent();

    userService.deleteUser(created.getId());

    assertThat(userService.findById(created.getId())).isEmpty();
  }

  @Test
  void deleteUser_then_createNewUser_and_updateUser() {
    // Step 1: Create and delete first user
    User firstUser = testUsersFromCsv.get(0);
    User createdFirst = userService.createUser(firstUser);
    Long deletedUserId = createdFirst.getId();

    userService.deleteUser(deletedUserId);

    assertThat(userService.findById(deletedUserId)).isEmpty();

    // Step 2: Create a new user from CSV
    User newUser = testUsersFromCsv.get(2);
    User createdNew = userService.createUser(newUser);

    assertThat(createdNew.getId()).isNotNull();
    assertThat(createdNew.getLogin()).isEqualTo("max_mueller");
    assertThat(createdNew.getEmail()).isEqualTo("max.mueller@example.com");

    // Step 3: Update the newly created user
    User updateData = new User();
    updateData.setEmail("max.mueller.updated@example.com");
    updateData.setPassword("newSecurePassword");
    updateData.setFirstName("Maximilian");
    updateData.setLastName("Müller-Schmidt");
    updateData.setLangKey("sv");
    updateData.setImageUrl("/images/max-updated.jpg");
    updateData.setActivated(false);

    User updated = userService.updateUser(createdNew.getId(), updateData);

    assertThat(updated.getId()).isEqualTo(createdNew.getId());
    assertThat(updated.getLogin()).isEqualTo("max_mueller");
    assertThat(updated.getFirstName()).isEqualTo("Maximilian");
    assertThat(updated.getLastName()).isEqualTo("Müller-Schmidt");
    assertThat(updated.getEmail()).isEqualTo("max.mueller.updated@example.com");
    assertThat(updated.getPassword()).isEqualTo("newSecurePassword");
    assertThat(updated.getLangKey()).isEqualTo("sv");
    assertThat(updated.getActivated()).isFalse();

    // Verify total users in repository
    List<User> allUsers = userService.findAll();
    assertThat(allUsers).hasSize(1);
  }

  @Test
  void createUser_withDuplicateLogin_throwsException() {
    User firstUser = testUsersFromCsv.get(0);
    userService.createUser(firstUser);

    User duplicateUser = new User();
    duplicateUser.setLogin("john_doe");
    duplicateUser.setPassword("different_password");
    duplicateUser.setEmail("different@example.com");

    assertThatThrownBy(() -> userService.createUser(duplicateUser))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Login already exists");
  }

  @Test
  void createUser_withDuplicateEmail_throwsException() {
    User firstUser = testUsersFromCsv.get(0);
    userService.createUser(firstUser);

    User duplicateUser = new User();
    duplicateUser.setLogin("different_login");
    duplicateUser.setPassword("password123");
    duplicateUser.setEmail("john.doe@example.com");

    assertThatThrownBy(() -> userService.createUser(duplicateUser))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Email already exists");
  }

  @Test
  void updateUser_nonExistentUser_throwsException() {
    User userUpdate = new User();
    userUpdate.setEmail("test@example.com");
    userUpdate.setPassword("password");
    userUpdate.setFirstName("Test");
    userUpdate.setLastName("User");

    assertThatThrownBy(() -> userService.updateUser(999L, userUpdate))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("User not found");
  }

  @Test
  void existsByLogin_returnsCorrectValue() {
    User userToCreate = testUsersFromCsv.get(0);
    userService.createUser(userToCreate);

    assertThat(userService.existsByLogin("john_doe")).isTrue();
    assertThat(userService.existsByLogin("non_existent_login")).isFalse();
  }

  @Test
  void existsByEmail_returnsCorrectValue() {
    User userToCreate = testUsersFromCsv.get(0);
    userService.createUser(userToCreate);

    assertThat(userService.existsByEmail("john.doe@example.com")).isTrue();
    assertThat(userService.existsByEmail("non_existent@example.com")).isFalse();
  }
}
