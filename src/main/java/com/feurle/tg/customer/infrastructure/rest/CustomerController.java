// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.customer.infrastructure.rest;

import com.feurle.tg.customer.application.CustomerService;
import com.feurle.tg.customer.domain.Customer;
import com.feurle.tg.customer.infrastructure.rest.dto.CreateCustomerRequest;
import com.feurle.tg.customer.infrastructure.rest.dto.CustomerResponse;
import com.feurle.tg.customer.infrastructure.rest.dto.UpdateCustomerRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CustomerController {

  private final CustomerService customerService;

  @GetMapping
  public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
    return ResponseEntity.ok(
        customerService.getAllCustomers().stream().map(this::mapToCustomerResponse).toList());
  }

  @GetMapping("/{id}")
  public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
    return ResponseEntity.ok(mapToCustomerResponse(customerService.getCustomerById(id)));
  }

  @GetMapping("/email/{email}")
  public ResponseEntity<CustomerResponse> getCustomerByEmail(@PathVariable String email) {
    return ResponseEntity.ok(mapToCustomerResponse(customerService.getCustomerByEmail(email)));
  }

  @PostMapping
  public ResponseEntity<CustomerResponse> createCustomer(
      @Valid @RequestBody CreateCustomerRequest request) {
    Customer customer =
        customerService.createCustomer(
            request.firstName(),
            request.lastName(),
            request.email(),
            request.phone(),
            request.address(),
            request.city(),
            request.state(),
            request.zip(),
            request.country());
    return ResponseEntity.status(HttpStatus.CREATED).body(mapToCustomerResponse(customer));
  }

  @PutMapping("/{id}")
  public ResponseEntity<CustomerResponse> updateCustomer(
      @PathVariable Long id, @Valid @RequestBody UpdateCustomerRequest request) {
    Customer customer =
        customerService.updateCustomer(
            id,
            request.firstName(),
            request.lastName(),
            request.email(),
            request.phone(),
            request.address(),
            request.city(),
            request.state(),
            request.zip(),
            request.country());
    return ResponseEntity.ok(mapToCustomerResponse(customer));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
    customerService.deleteCustomer(id);
    return ResponseEntity.noContent().build();
  }

  // ========== Mapping ==========

  private CustomerResponse mapToCustomerResponse(Customer customer) {
    return new CustomerResponse(
        customer.getId(),
        customer.getFirstName(),
        customer.getLastName(),
        customer.getEmail(),
        customer.getPhone(),
        customer.getAddress(),
        customer.getCity(),
        customer.getState(),
        customer.getZip(),
        customer.getCountry(),
        customer.getCreatedAt(),
        customer.getUpdatedAt());
  }
}
