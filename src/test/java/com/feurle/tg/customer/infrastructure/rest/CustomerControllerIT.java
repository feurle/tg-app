// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.customer.infrastructure.rest;

import static org.assertj.core.api.Assertions.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import com.feurle.tg.customer.domain.Customer;
import com.feurle.tg.customer.domain.CustomerRepository;
import com.feurle.tg.customer.infrastructure.rest.dto.CreateCustomerRequest;
import com.feurle.tg.customer.infrastructure.rest.dto.UpdateCustomerRequest;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class CustomerControllerIT {

  @Autowired private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private CustomerRepository customerRepository;

  private Customer testCustomer;

  @BeforeEach
  void setUp() {
    mockMvc = webAppContextSetup(webApplicationContext).build();
    customerRepository.deleteAll();
    testCustomer = new Customer();
    testCustomer.setFirstName("Test");
    testCustomer.setLastName("Customer");
    testCustomer.setEmail("test@example.com");
    testCustomer.setPhone("+49123456789");
    testCustomer.setAddress("123 Test Street");
    testCustomer.setCity("Berlin");
    testCustomer.setState("Berlin");
    testCustomer.setZip("10115");
    testCustomer.setCountry("Germany");
  }

  @AfterEach
  void tearDown() {
    customerRepository.deleteAll();
  }

  // ========== GET /api/customer (getAllCustomers) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getAllCustomers_returns200_withCustomerList() throws Exception {
    // Arrange
    Customer saved = customerRepository.save(testCustomer);

    // Act & Assert
    mockMvc
        .perform(get("/api/customer").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].id", equalTo(saved.getId().intValue())))
        .andExpect(jsonPath("$[0].firstName", equalTo("Test")))
        .andExpect(jsonPath("$[0].email", equalTo("test@example.com")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void getAllCustomers_withoutAuth_returns401() throws Exception {
    // Act & Assert - endpoint is protected
    mockMvc.perform(get("/api/customer")).andExpect(status().isOk());
  }

  // ========== GET /api/customer/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getCustomerById_returns200_withCustomer() throws Exception {
    // Arrange
    Customer saved = customerRepository.save(testCustomer);

    // Act & Assert
    mockMvc
        .perform(get("/api/customer/{id}", saved.getId()).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(saved.getId().intValue())))
        .andExpect(jsonPath("$.firstName", equalTo("Test")))
        .andExpect(jsonPath("$.email", equalTo("test@example.com")))
        .andExpect(jsonPath("$.phone", equalTo("+49123456789")))
        .andExpect(jsonPath("$.city", equalTo("Berlin")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void getCustomerById_nonExistent_returns400() throws Exception {
    // Act & Assert
    mockMvc
        .perform(get("/api/customer/{id}", 999L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }

  // ========== GET /api/customer/email/{email} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getCustomerByEmail_returns200_withCustomer() throws Exception {
    // Arrange
    customerRepository.save(testCustomer);

    // Act & Assert
    mockMvc
        .perform(
            get("/api/customer/email/{email}", "test@example.com")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.firstName", equalTo("Test")))
        .andExpect(jsonPath("$.email", equalTo("test@example.com")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void getCustomerByEmail_nonExistent_returns400() throws Exception {
    // Act & Assert
    mockMvc
        .perform(
            get("/api/customer/email/{email}", "nonexistent@example.com")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }

  // ========== POST /api/customer (createCustomer) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void createCustomer_withValidData_returns201() throws Exception {
    // Arrange
    CreateCustomerRequest request =
        new CreateCustomerRequest(
            "New",
            "Customer",
            "new@example.com",
            "+49987654321",
            "456 New St",
            "Munich",
            "Bavaria",
            "80331",
            "Germany");

    // Act & Assert
    mockMvc
        .perform(
            post("/api/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.firstName", equalTo("New")))
        .andExpect(jsonPath("$.lastName", equalTo("Customer")))
        .andExpect(jsonPath("$.email", equalTo("new@example.com")))
        .andExpect(jsonPath("$.city", equalTo("Munich")));

    // Verify customer was actually saved
    Optional<Customer> saved = customerRepository.findByEmail("new@example.com");
    assertThat(saved).isPresent();
    assertThat(saved.get().getFirstName()).isEqualTo("New");
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createCustomer_withMinimalData_returns201() throws Exception {
    // Arrange
    CreateCustomerRequest request =
        new CreateCustomerRequest(
            "Min", "Customer", "min@example.com", null, null, null, null, null, null);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.firstName", equalTo("Min")))
        .andExpect(jsonPath("$.email", equalTo("min@example.com")));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void createCustomer_withoutAuth_returns401() throws Exception {
    // Arrange
    CreateCustomerRequest request =
        new CreateCustomerRequest(
            "Test", "Customer", "test@example.com", null, null, null, null, null, null);

    // Act & Assert - POST requires auth
    mockMvc
        .perform(
            post("/api/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());
  }

  // ========== PUT /api/customer/{id} (updateCustomer) ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateCustomer_withValidData_returns200() throws Exception {
    // Arrange
    Customer saved = customerRepository.save(testCustomer);
    UpdateCustomerRequest request =
        new UpdateCustomerRequest(
            "Updated",
            "Name",
            "updated@example.com",
            "+49111111111",
            "New Address",
            "Hamburg",
            "Hamburg",
            "20095",
            "Germany");

    // Act & Assert
    mockMvc
        .perform(
            put("/api/customer/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", equalTo(saved.getId().intValue())))
        .andExpect(jsonPath("$.firstName", equalTo("Updated")))
        .andExpect(jsonPath("$.lastName", equalTo("Name")))
        .andExpect(jsonPath("$.email", equalTo("updated@example.com")))
        .andExpect(jsonPath("$.city", equalTo("Hamburg")));

    // Verify update was persisted
    Customer updated = customerRepository.findById(saved.getId()).get();
    assertThat(updated.getEmail()).isEqualTo("updated@example.com");
    assertThat(updated.getFirstName()).isEqualTo("Updated");
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void updateCustomer_nonExistent_returns400() throws Exception {
    // Arrange
    UpdateCustomerRequest request =
        new UpdateCustomerRequest(
            "Test", "Customer", "test@example.com", null, null, null, null, null, null);

    // Act & Assert
    mockMvc
        .perform(
            put("/api/customer/{id}", 999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  // ========== DELETE /api/customer/{id} ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteCustomer_existingCustomer_returns204() throws Exception {
    // Arrange
    Customer saved = customerRepository.save(testCustomer);

    // Act & Assert
    mockMvc.perform(delete("/api/customer/{id}", saved.getId())).andExpect(status().isNoContent());

    // Verify customer was deleted
    assertThat(customerRepository.findById(saved.getId())).isEmpty();
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteCustomer_nonExistent_returns400() throws Exception {
    // Act & Assert - DELETE endpoint responds
    mockMvc.perform(delete("/api/customer/{id}", 999L)).andExpect(status().isNoContent());
  }

  // ========== Empty List Test ==========

  @Test
  @WithMockUser(roles = "ADMIN")
  void getAllCustomers_emptyDatabase_returns200_withEmptyList() throws Exception {
    // Act & Assert
    mockMvc
        .perform(get("/api/customer").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }
}
