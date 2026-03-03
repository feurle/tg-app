// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.customer.application;

import static org.assertj.core.api.Assertions.*;

import com.feurle.tg.customer.domain.Customer;
import com.feurle.tg.customer.domain.CustomerRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class CustomerServiceTest {

  @Autowired private CustomerService customerService;

  @Autowired private CustomerRepository customerRepository;

  @BeforeEach
  void setUp() {
    customerRepository.deleteAll();
  }

  @Test
  void createCustomer_savesAndReturnsCustomer() {
    Customer customer =
        customerService.createCustomer(
            "Max",
            "Müller",
            "max@example.com",
            "+49123456789",
            "Hauptstr. 1",
            "Berlin",
            "BE",
            "10115",
            "Germany");

    assertThat(customer.getId()).isNotNull();
    assertThat(customer.getFirstName()).isEqualTo("Max");
    assertThat(customer.getLastName()).isEqualTo("Müller");
    assertThat(customer.getEmail()).isEqualTo("max@example.com");
    assertThat(customer.getPhone()).isEqualTo("+49123456789");
    assertThat(customer.getAddress()).isEqualTo("Hauptstr. 1");
    assertThat(customer.getCity()).isEqualTo("Berlin");
    assertThat(customer.getState()).isEqualTo("BE");
    assertThat(customer.getZip()).isEqualTo("10115");
    assertThat(customer.getCountry()).isEqualTo("Germany");
    assertThat(customer.getCreatedAt()).isNotNull();
    assertThat(customer.getUpdatedAt()).isNotNull();
  }

  @Test
  void getAllCustomers_returnsAllCustomers() {
    customerService.createCustomer(
        "Max",
        "Müller",
        "max@example.com",
        "+49123456789",
        "Hauptstr. 1",
        "Berlin",
        "BE",
        "10115",
        "Germany");
    customerService.createCustomer(
        "Lisa",
        "Schmidt",
        "lisa@example.com",
        "+49987654321",
        "Königstr. 2",
        "München",
        "BY",
        "80333",
        "Germany");

    List<Customer> customers = customerService.getAllCustomers();

    assertThat(customers).hasSize(2);
  }

  @Test
  void getCustomerById_returnsCustomer() {
    Customer created =
        customerService.createCustomer(
            "Max",
            "Müller",
            "max@example.com",
            "+49123456789",
            "Hauptstr. 1",
            "Berlin",
            "BE",
            "10115",
            "Germany");

    Customer found = customerService.getCustomerById(created.getId());

    assertThat(found.getId()).isEqualTo(created.getId());
    assertThat(found.getEmail()).isEqualTo("max@example.com");
  }

  @Test
  void getCustomerById_throwsExceptionWhenNotFound() {
    assertThatThrownBy(() -> customerService.getCustomerById(999L))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Customer not found: 999");
  }

  @Test
  void getCustomerByEmail_returnsCustomer() {
    customerService.createCustomer(
        "Max",
        "Müller",
        "max@example.com",
        "+49123456789",
        "Hauptstr. 1",
        "Berlin",
        "BE",
        "10115",
        "Germany");

    Customer found = customerService.getCustomerByEmail("max@example.com");

    assertThat(found.getFirstName()).isEqualTo("Max");
  }

  @Test
  void getCustomerByEmail_throwsExceptionWhenNotFound() {
    assertThatThrownBy(() -> customerService.getCustomerByEmail("notfound@example.com"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Customer not found with email");
  }

  @Test
  void updateCustomer_updatesAndReturnsCustomer() {
    Customer created =
        customerService.createCustomer(
            "Max",
            "Müller",
            "max@example.com",
            "+49123456789",
            "Hauptstr. 1",
            "Berlin",
            "BE",
            "10115",
            "Germany");

    Customer updated =
        customerService.updateCustomer(
            created.getId(),
            "Maximilian",
            "Mueller",
            "maximilian@example.com",
            "+49999999999",
            "Friedrichstr. 100",
            "Berlin",
            "BE",
            "10117",
            "Germany");

    assertThat(updated.getId()).isEqualTo(created.getId());
    assertThat(updated.getFirstName()).isEqualTo("Maximilian");
    assertThat(updated.getEmail()).isEqualTo("maximilian@example.com");
    assertThat(updated.getPhone()).isEqualTo("+49999999999");
  }

  @Test
  void deleteCustomer_removesCustomer() {
    Customer created =
        customerService.createCustomer(
            "Max",
            "Müller",
            "max@example.com",
            "+49123456789",
            "Hauptstr. 1",
            "Berlin",
            "BE",
            "10115",
            "Germany");

    customerService.deleteCustomer(created.getId());

    assertThatThrownBy(() -> customerService.getCustomerById(created.getId()))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
